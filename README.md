# CodeSync

CodeSync is a real-time collaborative coding platform that provides a unified workspace where multiple users can write code, communicate, execute programs, and receive AI-assisted coding support.

The platform is designed to reduce the need for switching between separate communication, coding, execution, and debugging tools. Instead, CodeSync brings these capabilities together inside a shared coding environment.

## Problem Statement

Teams often use multiple disconnected tools while working on programming projects. Communication platforms such as Discord, Google Meet, and Microsoft Teams provide communication and screen sharing, but they do not provide a complete environment for real-time collaborative code editing and shared code execution.

This creates several problems:

* Only one person may effectively control the code during screen sharing.
* Team members cannot directly edit the same code simultaneously.
* Developers need to switch between coding and communication applications.
* Running and debugging code collaboratively becomes inconvenient.
* Multiple disconnected tools increase context switching during teamwork.

## Proposed Solution

CodeSync provides a unified collaborative programming workspace where team members can:

* Create or join a private coding room.
* Write and edit code together in real time.
* Communicate through integrated chat and voice.
* Synchronize code changes between room members.
* Execute code and share results with the team.
* Receive AI assistance for coding and debugging.
* View execution results and errors collaboratively.
* Maintain saved code versions and room information.

The main idea is:

> Code together, not just share screens.

---

# How CodeSync Works

CodeSync follows a five-stage workflow.

## 1. Create or Join a Room

A user can create a new coding room or join an existing room using a Room ID.

### Create Room

The room creator starts a new collaborative coding session. The system generates a unique Room ID and can optionally apply a password.

### Join Room

Other users enter the Room ID to join the existing coding session.

The room provides an isolated collaborative environment for the participating users.

---

## 2. Real-Time Collaboration

After joining a room, users enter the collaborative workspace.

### Shared Code Editor

The platform provides a shared code editor where multiple users can write and edit code together.

Changes made by one participant are synchronized with other participants in real time.

### Chat

Users can communicate through an integrated chat while working on the code.

This avoids the need to open a separate communication application.

### Live Synchronization

Code and collaboration events are transmitted through real-time communication mechanisms so that users can see changes without manually refreshing the page.

The goal is to provide a shared coding experience where all room members work on the same active code.

---

# 3. Backend and Code Execution

The backend manages rooms, synchronization, persistence, and code execution.

### Server

The server handles:

* Room management
* Room validation
* Synchronization
* Saving code
* Communication between users

### Database

The database stores information such as:

* Coding rooms
* Code versions
* Saved code
* User/session-related data

### Code Execution

When users want to execute their code, the code is passed to the execution layer.

The execution environment is designed to isolate user code and return:

* Program output
* Compilation errors
* Runtime errors
* Execution results

The results can then be shared with the members of the collaborative room.

---

# 4. AI Assistant

CodeSync includes an AI assistant to provide coding support without requiring users to leave the collaborative workspace.

The AI assistant provides four main capabilities.

### Explain Code

Users can select code or ask a question and receive an explanation of how the code works.

### Debug and Fix

The AI can analyze code and errors and suggest possible fixes.

### Code Review

The assistant can review code and provide suggestions for improving the implementation.

### Generate Code

Users can describe what they want to build and receive code suggestions from the AI assistant.

The AI assistant is intended to support the development workflow rather than replace the collaborative coding process.

---

# 5. Output and Error Sharing

After code execution, the platform displays the execution results or errors.

Room members can view the output while continuing to collaborate.

The workflow can therefore operate as:

```text
Write Code
    |
    v
Collaborate in Real Time
    |
    v
Run Code
    |
    v
Output / Error
    |
    v
AI Assistance
    |
    v
Debug / Fix
    |
    v
Run Again
```

This creates a continuous collaborative development and debugging cycle.

---

# System Architecture

The CodeSync architecture is divided into several major components.

```text
Users
  |
  v
Create / Join Room
  |
  v
Collaborative Workspace
  |
  +---- Shared Code Editor
  |
  +---- Chat
  |
  +---- Real-Time Synchronization
  |
  v
Backend Server
  |
  +---- Room Management
  |
  +---- Data Synchronization
  |
  +---- Code Persistence
  |
  +---- Code Execution
  |
  v
AI Assistant
  |
  +---- Explain Code
  +---- Debug & Fix
  +---- Code Review
  +---- Generate Code
  |
  v
Output / Errors
  |
  v
All Room Members
```

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* React
* Monaco Editor
* Tailwind CSS

## Backend

* Node.js
* Express.js

## Real-Time Communication

* WebSockets
* Socket.IO
* WebRTC
* P2P Audio Mesh

## Database

* MongoDB
* Mongoose

## Code Execution

* Compiler API
* Isolated execution environment

---

# Real-Time Communication

CodeSync uses real-time communication to synchronize collaboration events between users.

The communication layer is responsible for events such as:

* Code changes
* Chat messages
* Room events
* Collaboration updates

Socket.IO/WebSockets are used for real-time data synchronization, while WebRTC is used for peer-to-peer voice communication.

This allows users to communicate and collaborate without depending entirely on external communication platforms.

---

# Voice Communication

CodeSync integrates voice communication directly into the collaborative workspace.

WebRTC enables peer-to-peer audio communication between room members.

The purpose is to allow users to discuss their code while simultaneously working inside the shared editor.

---

# Security and Privacy

Because CodeSync allows users to execute code, security is an important part of the system.

The architecture includes:

* Room-based access
* Encrypted communication
* Isolated code execution
* Controlled execution environments
* Separation between users and collaborative rooms

The execution layer is intended to prevent user code from directly affecting the main application environment.

---

# Key Benefits

CodeSync provides several benefits for collaborative programming:

* Real-time collaborative code editing
* Integrated communication
* Shared code execution
* AI-assisted development
* Collaborative debugging
* Reduced dependency on multiple disconnected tools
* Better visibility of code changes and execution results
* Support for remote learning and development teams
* Useful for hackathons and team-based programming

---

# Target Users

CodeSync is primarily designed for:

* Students
* Developers
* Hackathon teams
* Coding clubs
* Remote development teams
* Programming project teams
* Technical learning groups

---

# Future Scope

The planned future improvements include:

* Multi-language code execution
* Screen sharing
* Version control integration
* AI-powered code review
* Role-based permissions
* Session replay
* Advanced collaboration analytics

These features can extend CodeSync from a collaborative coding prototype into a more complete collaborative development environment.

---

# Project Workflow

The complete CodeSync workflow can be summarized as:

```text
Create / Join Room
        |
        v
Collaborative Workspace
        |
        +---- Shared Code Editor
        |
        +---- Chat
        |
        +---- Voice Communication
        |
        +---- Live Synchronization
        |
        v
Backend
        |
        +---- Room Management
        |
        +---- Database
        |
        +---- Code Execution
        |
        v
AI Assistant
        |
        +---- Explain
        +---- Debug
        +---- Review
        +---- Generate
        |
        v
Output / Errors
        |
        v
Room Members
```

---

# Demo Video

A demonstration video showing the working of CodeSync will be available here:

**YouTube:** : https://youtu.be/RgaKHsvHCAc?si=QV_tcDnHx9DvMU77

The video demonstrates the CodeSync workflow, including room creation/joining, collaborative coding, real-time synchronization, code execution, AI assistance, and output/error sharing.

---

# Hackathon

**Hackathon:** AETHER HackConquest 2026
**Team:** SoftDecoders
**Project:** CodeSync
**Theme:** Web/App Development

## Conclusion

CodeSync aims to make collaborative programming more connected by combining real-time code editing, communication, code execution, and AI assistance within a single workspace.

Instead of switching between separate applications for coding, communication, execution, and debugging, users can perform these activities within the same collaborative environment.

CodeSync focuses on making programming a shared experience where team members can write code, communicate, execute programs, identify problems, and improve their code together in real time.
