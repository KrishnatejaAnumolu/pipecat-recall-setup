// This works both locally and in recall.ai
import { useEffect, useRef, useState } from 'react'

function App() {
  const [status, setStatus] = useState<string>('Connecting...')
  const audioRef = useRef<HTMLAudioElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  const waitForIceGatheringComplete = async (pc: RTCPeerConnection, timeoutMs: number = 2000): Promise<void> => {
    if (pc.iceGatheringState === 'complete') return;
    console.log("Waiting for ICE gathering to complete. Current state:", pc.iceGatheringState);
    return new Promise((resolve) => {
      const cleanup = (timeoutId: number) => {
        pc.removeEventListener('icegatheringstatechange', checkState);
        clearTimeout(timeoutId);
      };
      const checkState = () => {
        console.log("icegatheringstatechange:", pc.iceGatheringState);
        if (pc.iceGatheringState === 'complete') {
          cleanup(timeoutId);
          resolve();
        }
      };
      const onTimeout = () => {
        console.warn(`ICE gathering timed out after ${timeoutMs} ms.`);
        cleanup(timeoutId);
        resolve();
      };
      pc.addEventListener('icegatheringstatechange', checkState);
      const timeoutId = setTimeout(onTimeout, timeoutMs);
      // Checking the state again to avoid any eventual race condition
      checkState();
    });
  };

  const addPeerConnectionEventListeners = (pc: RTCPeerConnection) => {
    pc.oniceconnectionstatechange = () => {
      console.log("oniceconnectionstatechange", pc?.iceConnectionState)
    }
    pc.onconnectionstatechange = () => {
      console.log("onconnectionstatechange", pc?.connectionState)
      const connectionState = pc?.connectionState
      if (connectionState === 'connected') {
        setStatus("Connected")
      } else if (connectionState === 'disconnected') {
        setStatus("Disconnected")
      }
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
      } else {
        console.log("All ICE candidates have been sent.");
      }
    };
  }

  const createSmallWebRTCConnection = async (audioTrack: MediaStreamTrack): Promise<RTCPeerConnection> => {
    const config: RTCConfiguration = {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ],
    };
    const pc = new RTCPeerConnection(config)
    addPeerConnectionEventListeners(pc)
    pc.ontrack = (e) => {
      if (audioRef.current) {
        audioRef.current.srcObject = e.streams[0]
      }
    }
    // SmallWebRTCTransport expects to receive both transceivers
    pc.addTransceiver(audioTrack, { direction: 'sendrecv' })
    pc.addTransceiver('video', { direction: 'sendrecv' })
    await pc.setLocalDescription(await pc.createOffer())
    await waitForIceGatheringComplete(pc)
    const offer = pc.localDescription
    const response = await fetch('/api/offer', {
      body: JSON.stringify({ sdp: offer!.sdp, type: offer!.type }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const answer = await response.json()
    await pc.setRemoteDescription(answer)
    return pc
  }

  const connect = async () => {
    setStatus("Connecting...")
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    peerConnectionRef.current = await createSmallWebRTCConnection(audioStream.getAudioTracks()[0])
  }

  const disconnect = () => {
    if (!peerConnectionRef.current) {
      return
    }
    peerConnectionRef.current.close()
    peerConnectionRef.current = null
    setStatus("Disconnected")
  }

  // Auto-connect on component mount
  useEffect(() => {
    connect()

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [])

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw'
      }}>
        <p style={{ fontSize: '20px' }}>{status}</p>
      </div>
      <audio ref={audioRef} autoPlay />
    </>
  )
}

export default App
