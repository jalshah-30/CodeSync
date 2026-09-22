// Real-Time WebRTC Voice & Audio Level Detection Manager

export type MicPermissionStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported" | "no-device";

interface VoiceManagerOptions {
  onSpeakingChange: (isSpeaking: boolean) => void;
  onVolumeChange: (volume: number) => void; // 0 to 100
  onStatusChange: (status: MicPermissionStatus, errorMsg?: string) => void;
  sendSignal: (targetSocketId: string, signal: any) => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export class VoiceManager {
  private options: VoiceManagerOptions;
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isMuted: boolean = true;
  private isDeafened: boolean = false;
  private peers: Map<string, { pc: RTCPeerConnection; audioEl: HTMLAudioElement }> = new Map();
  private isSelfLoopback: boolean = false;
  private loopbackGain: GainNode | null = null;
  private isSpeaking: boolean = false;
  private silenceTimer: any = null;

  constructor(options: VoiceManagerOptions) {
    this.options = options;
  }

  // Initialize and request microphone
  public async initMicrophone(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.options.onStatusChange("unsupported", "Your browser does not support microphone capture.");
      return false;
    }

    try {
      this.options.onStatusChange("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;

      // Ensure tracks follow current mute state
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted;
      });

      // Setup Web Audio Analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        this.audioContext = ctx;

        if (ctx.state === "suspended") {
          await ctx.resume().catch(() => {});
        }

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);
        this.analyser = analyser;

        // Setup optional self loopback node
        const loopback = ctx.createGain();
        loopback.gain.value = this.isSelfLoopback ? 1.0 : 0;
        source.connect(loopback);
        loopback.connect(ctx.destination);
        this.loopbackGain = loopback;

        this.startLevelMonitoring();
      }

      this.options.onStatusChange("granted");

      // Attach audio track to any existing peer connections
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
        message = "Microphone permission blocked. Please check your browser address bar permissions.";
      } else {
        message = err.message || "Could not start microphone.";
      }

      this.options.onStatusChange(status, message);
      return false;
    }
  }

  // Audio level monitoring loop
  private startLevelMonitoring() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.analyser) return;

      if (this.isMuted) {
        if (this.isSpeaking) {
          this.isSpeaking = false;
          this.options.onSpeakingChange(false);
        }
        this.options.onVolumeChange(0);
        this.animFrameId = requestAnimationFrame(update);
        return;
      }

      // Check audioContext state
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

      // Scale to 0 - 100
      const volumeLevel = Math.min(100, Math.round(rms * 450));
      this.options.onVolumeChange(volumeLevel);

      // Speech detection threshold (RMS > 0.02)
      const isVoiceActive = rms > 0.02;

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
        // 350ms hangover to prevent rapid blinking between words
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
  public async setMuted(muted: boolean) {
    this.isMuted = muted;

    if (!muted && !this.localStream) {
      await this.initMicrophone();
    }

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = !muted;
      });
    }

    if (this.audioContext && this.audioContext.state === "suspended" && !muted) {
      this.audioContext.resume().catch(() => {});
    }

    if (muted) {
      if (this.isSpeaking) {
        this.isSpeaking = false;
        this.options.onSpeakingChange(false);
      }
      this.options.onVolumeChange(0);
    }
  }

  // Set Deafen
  public setDeafened(deafened: boolean) {
    this.isDeafened = deafened;
    this.peers.forEach(({ audioEl }) => {
      audioEl.muted = deafened;
    });
  }

  // Toggle Self Loopback (Hearing yourself to test mic)
  public toggleSelfLoopback(): boolean {
    this.isSelfLoopback = !this.isSelfLoopback;
    if (this.loopbackGain) {
      this.loopbackGain.gain.value = this.isSelfLoopback ? 0.9 : 0;
    }
    return this.isSelfLoopback;
  }

  // Connect to a peer collaborator
  public connectToPeer(targetSocketId: string, isInitiator: boolean = true) {
    if (this.peers.has(targetSocketId)) return;

    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioEl.muted = this.isDeafened;

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          audioEl.srcObject = event.streams[0];
          audioEl.play().catch(() => {
            // Autoplay policy fallback: resume on user gesture
          });
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

      // Add local tracks if stream exists
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, this.localStream!);
        });
      }

      this.peers.set(targetSocketId, { pc, audioEl });

      if (isInitiator) {
        pc.createOffer({ offerToReceiveAudio: true })
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

  // Handle incoming WebRTC signal
  public async handleSignal(senderSocketId: string, signal: any) {
    if (!signal) return;

    let peer = this.peers.get(senderSocketId);

    if (!peer) {
      this.connectToPeer(senderSocketId, false);
      peer = this.peers.get(senderSocketId);
    }

    if (!peer) return;
    const { pc } = peer;

    try {
      if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        // Add local tracks
        if (this.localStream) {
          this.localStream.getAudioTracks().forEach((track) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
            if (!sender) {
              pc.addTrack(track, this.localStream!);
            }
          });
        }
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.options.sendSignal(senderSocketId, {
          type: "answer",
          sdp: pc.localDescription,
        });
      } else if (signal.type === "answer") {
        if (pc.signalingState !== "stable") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        }
      } else if (signal.type === "candidate" && signal.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
      }
    } catch (err) {
      console.warn("Error handling WebRTC signal:", err);
    }
  }

  // Attach local stream to all connected peers
  private attachLocalStreamToPeers() {
    if (!this.localStream) return;
    this.peers.forEach(({ pc }) => {
      this.localStream!.getAudioTracks().forEach((track) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
        if (!sender) {
          pc.addTrack(track, this.localStream!);
        } else {
          sender.replaceTrack(track).catch(() => {});
        }
      });
    });
  }

  // Disconnect a peer
  public removePeer(socketId: string) {
    const peer = this.peers.get(socketId);
    if (peer) {
      peer.pc.close();
      peer.audioEl.srcObject = null;
      this.peers.delete(socketId);
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
  }
}
