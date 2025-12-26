import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

export function usePeer(localStream, onDataReceived) {
    const [peerId, setPeerId] = useState('');
    const [connections, setConnections] = useState([]);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerRef = useRef(null);

    // Initialize Peer
    useEffect(() => {
        const peer = new Peer(null, {
            debug: 1,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:stun3.l.google.com:19302' },
                    { urls: 'stun:stun4.l.google.com:19302' },
                ]
            }
        });

        peer.on('open', (id) => {
            setPeerId(id);
            console.log('My peer ID is: ' + id);
        });

        // Handle Errors
        peer.on('error', (err) => {
            console.error("PeerJS Error:", err);
            // Retry logic or user notification could go here
        });

        peer.on('connection', (conn) => {
            console.log("Incoming connection from:", conn.peer);
            handleConnection(conn);
        });

        peer.on('call', (call) => {
            console.log("Receiving call from:", call.peer);
            if (!localStream) {
                console.warn("No local stream to answer call with!");
                // Try to answer anyway to establish connection (receive only?)
                // Or better, component should ensure stream is ready.
            }
            call.answer(localStream); // Answer with our stream

            call.on('stream', (stream) => {
                console.log("Received remote stream");
                setRemoteStream(stream);
            });

            call.on('error', (err) => {
                console.error("Call error:", err);
            });
        });

        peerRef.current = peer;

        return () => {
            // Clean up connections but maybe delay peer destroy for hot-reload?
            // peer.destroy(); 
            // Actually, for React Strict Mode in dev, destroy is correct.
            peer.destroy();
        };
    }, [localStream]); // Re-init if localStream changes to ensure fresh streams in calls

    const handleConnection = (conn) => {
        conn.on('open', () => {
            setConnections(prev => [...prev, conn]);
        });

        conn.on('data', (data) => {
            if (onDataReceived) {
                onDataReceived(data);
            }
        });

        conn.on('close', () => {
            setConnections(prev => prev.filter(c => c.peer !== conn.peer));
        });
    };

    const connectToPeer = (remotePeerId) => {
        if (!peerRef.current) return;

        // Data Connection
        const conn = peerRef.current.connect(remotePeerId);
        handleConnection(conn);

        // Media Call
        if (localStream) {
            console.log("Calling peer with video...");
            const call = peerRef.current.call(remotePeerId, localStream);
            call.on('stream', (stream) => {
                setRemoteStream(stream);
            });
        }
    };

    const broadcast = (data) => {
        connections.forEach(conn => conn.send(data));
    };

    return { peerId, connectToPeer, broadcast, remoteStream };
}
