// Real-Time WebRTC Voice & Audio Level Detection Manager

export type MicPermissionStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported"
  | "no-device";

interface VoiceManagerOptions {
  onSpeakingChange: (isSpeaking: boolean) => void;
  onVolumeChange: (volume: number) => void; // 0 to 100
  onStatusChange: (status: MicPermissionStatus, errorMsg?: string) => void;
  sendSignal: (targetSocketId: string, signal: any) => void;
  onRemoteStream?: (targetSocketId: string, stream: MediaStream) => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
};

export class VoiceManager {
  private options: VoiceManagerOptions;
  private localStream: MediaStream | null = null;
  private localVideoStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isMuted: boolean = true;
  private isDeafened: boolean = false;
  private peers: Map<
    string,
    {
      pc: RTCPeerConnection;
      audioEl: HTMLAudioElement;
      transceiver?: RTCRtpTransceiver;
      videoTransceiver?: RTCRtpTransceiver;
    }
  > = new Map();
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private isSelfLoopback: boolean = false;
  private loopbackGain: GainNode | null = null;
  private isSpeaking: boolean = false;
  private silenceTimer: any = null;
  private remoteStreams: Map<string, MediaStream> = new Map();

  constructor(options: VoiceManagerOptions) {
    this.options = options;
  }

  // Initialize and request microphone
  public async initMicrophone(): Promise<boolean> {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      this.options.onStatusChange(
        "unsupported",
        "Your browser does not support microphone capture."
      );
      return false;
    }

    try {
      this.options.onStatusChange("requesting");

      let stream: MediaStream;
      try {
        // High fidelity audio constraints
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      } catch (advancedErr) {
        console.warn("Advanced audio constraints rejected, falling back to basic audio:", advancedErr);
        // Fallback to basic audio
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      this.localStream = stream;

      // Follow current mute state for transmission
      const initialAudioTrack = stream.getAudioTracks()[0];
      if (initialAudioTrack) {
        initialAudioTrack.enabled = !this.isMuted || this.isSelfLoopback;
      }

      // Setup Web Audio Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext || this.audioContext.state === "closed") {
          this.audioContext = new AudioCtx();
        }
        const ctx = this.audioContext;

        if (ctx.state === "suspended") {
          await ctx.resume().catch(() => {});
        }

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);
        this.analyser = analyser;

        // Setup optional self loopback node (hear own voice in headphones)
        const loopback = ctx.createGain();
        loopback.gain.value = this.isSelfLoopback ? 0.85 : 0;
        source.connect(loopback);
        loopback.connect(ctx.destination);
        this.loopbackGain = loopback;

        this.startLevelMonitoring();
      }

      this.options.onStatusChange("granted");

      // Attach newly acquired track to any existing peer connections
      this.attachLocalStreamToPeers();

      return true;
    } catch (err: any) {
      console.warn("Microphone access failed:", err);
      let status: MicPermissionStatus = "denied";
      let message = "Microphone access was denied. Please allow microphone access in your browser.";

      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        status = "no-device";
        message = "No microphone device detected on this system.";
      } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        status = "denied";
        message =
          "Microphone permission blocked. Click the lock/camera icon in your browser address bar to allow microphone access.";
      } else {
        message = err.message || "Could not access microphone.";
      }

      this.options.onStatusChange(status, message);
      return false;
    }
  }

  // Audio level monitoring loop
  private startLevelMonitoring() {
    if (!this.analyser) return;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.analyser) return;

      // If muted and not doing self-test loopback, volume is zero
      if (this.isMuted && !this.isSelfLoopback) {
        if (this.isSpeaking) {
          this.isSpeaking = false;
          this.options.onSpeakingChange(false);
        }
        this.options.onVolumeChange(0);
        this.animFrameId = requestAnimationFrame(update);
        return;
      }

      // Resume AudioContext if suspended
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      this.analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const norm = (dataArray[i] - 128) / 128;
        sum += norm * norm;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      // Sensitive scaling from 0 to 100
      const volumeLevel = Math.min(100, Math.round(Math.pow(rms * 9, 0.75) * 55));
      this.options.onVolumeChange(volumeLevel);

      // Speech detection threshold (RMS > 0.015)
      const isVoiceActive = rms > 0.015;

      if (isVoiceActive) {
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.options.onSpeakingChange(true);
        }
      } else if (this.isSpeaking && !this.silenceTimer) {
        // 350ms hangover to prevent rapid blinking between syllables
        this.silenceTimer = setTimeout(() => {
          this.isSpeaking = false;
          this.options.onSpeakingChange(false);
          this.silenceTimer = null;
        }, 350);
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    update();
  }

  // Set Mute
  public async setMuted(muted: boolean): Promise<boolean> {
    this.isMuted = muted;

    if (!muted && !this.localStream) {
      const success = await this.initMicrophone();
      if (!success) {
        this.isMuted = true;
        return false;
      }
    }

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = !muted || this.isSelfLoopback;
      });
    }

    if (this.audioContext && this.audioContext.state === "suspended" && (!muted || this.isSelfLoopback)) {
      await this.audioContext.resume().catch(() => {});
    }

    if (muted && !this.isSelfLoopback) {
      if (this.isSpeaking) {
        this.isSpeaking = false;
        this.options.onSpeakingChange(false);
      }
      this.options.onVolumeChange(0);
    }

    return true;
  }

  // Set Deafen (Mute incoming voices)
  public setDeafened(deafened: boolean) {
    this.isDeafened = deafened;
    this.peers.forEach(({ audioEl }) => {
      audioEl.muted = deafened;
    });
  }

  // Toggle Self Loopback (Hearing yourself in headphones to test mic)
  public async toggleSelfLoopback(): Promise<boolean> {
    if (!this.localStream) {
      const ok = await this.initMicrophone();
      if (!ok) return false;
    }

    this.isSelfLoopback = !this.isSelfLoopback;

    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume().catch(() => {});
    }

    if (this.loopbackGain) {
      this.loopbackGain.gain.value = this.isSelfLoopback ? 0.85 : 0;
    }

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = this.isSelfLoopback || !this.isMuted;
      });
    }

    return this.isSelfLoopback;
  }

  // Play a pleasant test chime to verify output audio (speakers/headphones)
  public playTestChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = this.audioContext || new AudioCtx();
      this.audioContext = ctx;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Dual tone pleasant chime (C5 & G5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2); // C6

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.05);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn("Could not play test chime:", e);
    }
  }

  // Connect to a peer collaborator in the mesh
  public connectToPeer(targetSocketId: string, isInitiator: boolean = true) {
    if (this.peers.has(targetSocketId)) return;

    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioEl.muted = this.isDeafened;

      // Pre-negotiate audio and video channels
      const transceiver = pc.addTransceiver("audio", { direction: "sendrecv" });
      const videoTransceiver = pc.addTransceiver("video", { direction: "sendrecv" });

      // If local audio track is already active, attach it immediately to transceiver
      if (this.localStream) {
        const track = this.localStream.getAudioTracks()[0];
        if (track) {
          transceiver.sender.replaceTrack(track).catch(() => {});
        }
      }

      // If local video track is active, attach it immediately
      if (this.localVideoStream) {
        const vTrack = this.localVideoStream.getVideoTracks()[0];
        if (vTrack) {
          videoTransceiver.sender.replaceTrack(vTrack).catch(() => {});
        }
      }

      pc.ontrack = (event) => {
        let stream = event.streams && event.streams[0];
        if (!stream) {
          let existing = this.remoteStreams.get(targetSocketId);
          if (!existing) {
            existing = new MediaStream();
            this.remoteStreams.set(targetSocketId, existing);
          }
          if (event.track && !existing.getTracks().some((t) => t.id === event.track.id)) {
            existing.addTrack(event.track);
          }
          stream = existing;
        } else {
          this.remoteStreams.set(targetSocketId, stream);
        }

        if (event.track.kind === "audio") {
          audioEl.srcObject = stream;
          audioEl.play().catch((err) => {
            console.warn("Autoplay policy prevented audio, resuming on first interaction:", err);
            const resumeAudio = () => {
              audioEl.play().catch(() => {});
              window.removeEventListener("click", resumeAudio);
              window.removeEventListener("keydown", resumeAudio);
            };
            window.addEventListener("click", resumeAudio, { once: true });
            window.addEventListener("keydown", resumeAudio, { once: true });
          });
        }

        if (this.options.onRemoteStream && stream) {
          this.options.onRemoteStream(targetSocketId, stream);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.options.sendSignal(targetSocketId, {
            type: "candidate",
            candidate: event.candidate,
          });
        }
      };

      this.peers.set(targetSocketId, { pc, audioEl, transceiver, videoTransceiver });

      if (isInitiator) {
        pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            this.options.sendSignal(targetSocketId, {
              type: "offer",
              sdp: pc.localDescription,
            });
          })
          .catch((err) => console.warn("WebRTC createOffer error:", err));
      }
    } catch (e) {
      console.warn("Peer connection setup error:", e);
    }
  }

  // Handle incoming WebRTC signal from peer
  public async handleSignal(senderSocketId: string, signal: any) {
    if (!signal) return;

    let peer = this.peers.get(senderSocketId);

    if (!peer) {
      this.connectToPeer(senderSocketId, false);
      peer = this.peers.get(senderSocketId);
    }

    if (!peer) return;
    const { pc, transceiver } = peer;

    try {
      if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        // Attach local tracks if present
        if (this.localStream) {
          const track = this.localStream.getAudioTracks()[0];
          if (track && transceiver) {
            transceiver.sender.replaceTrack(track).catch(() => {});
          }
        }
        if (this.localVideoStream && peer.videoTransceiver) {
          const vTrack = this.localVideoStream.getVideoTracks()[0];
          if (vTrack) {
            peer.videoTransceiver.sender.replaceTrack(vTrack).catch(() => {});
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.options.sendSignal(senderSocketId, {
          type: "answer",
          sdp: pc.localDescription,
        });

        // Drain any pending ICE candidates queued before remoteDescription was set
        const queue = this.pendingCandidates.get(senderSocketId) || [];
        for (const candidate of queue) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
        this.pendingCandidates.delete(senderSocketId);
      } else if (signal.type === "answer") {
        if (pc.signalingState !== "stable") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          // Drain queued candidates
          const queue = this.pendingCandidates.get(senderSocketId) || [];
          for (const candidate of queue) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
          }
          this.pendingCandidates.delete(senderSocketId);
        }
      } else if (signal.type === "candidate" && signal.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
        } else {
          // Queue candidate until setRemoteDescription completes
          if (!this.pendingCandidates.has(senderSocketId)) {
            this.pendingCandidates.set(senderSocketId, []);
          }
          this.pendingCandidates.get(senderSocketId)!.push(signal.candidate);
        }
      }
    } catch (err) {
      console.warn("Error handling WebRTC signal:", err);
    }
  }

  // Attach local stream to all connected peers
  private attachLocalStreamToPeers() {
    if (!this.localStream) return;
    const track = this.localStream.getAudioTracks()[0];
    if (!track) return;

    this.peers.forEach(({ pc, transceiver }) => {
      if (transceiver && transceiver.sender) {
        transceiver.sender.replaceTrack(track).catch((err) => {
          console.warn("replaceTrack error:", err);
        });
      } else {
        const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
        if (sender) {
          sender.replaceTrack(track).catch(() => {});
        } else {
          pc.addTrack(track, this.localStream!);
        }
      }
    });
  }

  // Update or broadcast local video stream across all peer connections
  public setLocalVideoStream(stream: MediaStream | null) {
    this.localVideoStream = stream;
    const vTrack = stream ? stream.getVideoTracks()[0] || null : null;

    this.peers.forEach(({ pc, videoTransceiver }, targetSocketId) => {
      if (videoTransceiver && videoTransceiver.sender) {
        videoTransceiver.sender.replaceTrack(vTrack).then(() => {
          if (vTrack && pc.signalingState === "stable") {
            pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
              .then((offer) => pc.setLocalDescription(offer))
              .then(() => {
                this.options.sendSignal(targetSocketId, {
                  type: "offer",
                  sdp: pc.localDescription,
                });
              })
              .catch(() => {});
          }
        }).catch((err) => {
          console.warn("replaceTrack error:", err);
        });
      } else if (vTrack && stream) {
        pc.addTrack(vTrack, stream);
      }
    });
  }

  // Clean up peers that left the room
  public cleanDisconnectedPeers(activeSocketIds: Set<string>) {
    this.peers.forEach((_, socketId) => {
      if (!activeSocketIds.has(socketId)) {
        this.removePeer(socketId);
      }
    });
  }

  // Disconnect a peer
  public removePeer(socketId: string) {
    const peer = this.peers.get(socketId);
    if (peer) {
      peer.pc.close();
      peer.audioEl.srcObject = null;
      this.peers.delete(socketId);
      this.pendingCandidates.delete(socketId);
      this.remoteStreams.delete(socketId);
    }
  }

  // Cleanup all audio resources
  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.peers.forEach(({ pc, audioEl }) => {
      pc.close();
      audioEl.srcObject = null;
    });
    this.peers.clear();
    this.pendingCandidates.clear();
  }
}
