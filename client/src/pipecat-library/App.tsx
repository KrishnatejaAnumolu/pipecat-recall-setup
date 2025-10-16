// This works both locally but NOT in recall.ai. Check ./error.log for more details.
import { useEffect, useMemo, useState } from 'react'
import { PipecatClient } from '@pipecat-ai/client-js'
import { PipecatClientProvider, PipecatClientAudio, usePipecatClient } from '@pipecat-ai/client-react'
import { SmallWebRTCTransport } from '@pipecat-ai/small-webrtc-transport'

function SmallWebRTCContent() {
  const client = usePipecatClient()
  const [status, setStatus] = useState<string>('Disconnected')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!client) return

    let mounted = true

    client.on('connected', () => {
      if (mounted) {
        setStatus('Connected')
        setError('')
      }
    })
    
    client.on('transportStateChanged', (state) => {
      console.log('Transport state changed to:', state)
    })

    client.on('deviceError', (error) => {
      console.error('Device error:', error)
    })

    client.on('disconnected', () => {
      if (mounted) {
        setStatus('Disconnected')
      }
    })

    client.on('botReady', () => {
      if (mounted) {
        setStatus('Bot Ready')
      }
    })

    client.on('error', (err) => {
      if (mounted) {
        setError(typeof err === 'string' ? err : 'An error occurred')
        setStatus('Error')
      }
    })

    const connect = async () => {
      try {
        if (!mounted) return

        setStatus('Connecting...')

        await client.connect({
          connection_url: `${window.location.origin}/api/offer`
        })
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect')
          setStatus('Connection Failed')
        }
      }
    }

    connect()

    return () => {
      mounted = false
      if (client) {
        client.disconnect()
      }
    }
  }, [client])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>SmallWebRTC with Pipecat Client</h1>
      <p style={{ fontSize: '20px', margin: '20px' }}>
        Status: <strong>{status}</strong>
      </p>
      {error && (
        <p style={{ color: 'red', fontSize: '16px' }}>
          Error: {error}
        </p>
      )}
      <PipecatClientAudio />
    </div>
  )
}

function SmallWebRTC() {
  const client = useMemo(() => {
    const transport = new SmallWebRTCTransport({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    })

    return new PipecatClient({
      transport,
      enableMic: true,
      enableCam: false,
    })
  }, [])

  return (
    <PipecatClientProvider client={client}>
      <SmallWebRTCContent />
    </PipecatClientProvider>
  )
}

export default SmallWebRTC