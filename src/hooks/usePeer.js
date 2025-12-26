import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

export function usePeer(localStream, onDataReceived) {
    const [peerId, setPeerId] = useState('');
    const [connections, setConnections] = useState([]);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerRef = useRef(null);

    const streamRef = useRef(localStream);

    // Keep streamRef updated
    useEffect(() => {
        streamRef.current = localStream;
    }, [localStream]);

    // Initialize Peer (Once)
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
                    { urls: 'stun:global.stun.twilio.com:3478' }
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
            const currentStream = streamRef.current;
            if (!currentStream) {
                console.warn("No local stream to answer call with!");
            }
            call.answer(currentStream); // Answer with our stream (or undefined if not ready)

            call.on('stream', (stream) => {
                console.log("Received remote stream");
                setRemoteStream(stream);
            });

            call.on('close', () => {
                console.log("Call closed");
                setRemoteStream(null);
            });

            call.on('error', (err) => {
                console.error("Call error:", err);
                setRemoteStream(null);
            });
        });

        peerRef.current = peer;

        return () => {
            // Clean up connections but maybe delay peer destroy for hot-reload?
            // peer.destroy(); 
            // Actually, for React Strict Mode in dev, destroy is correct.
            peer.destroy();
        };
    }, []); // Empty dependency array: Peer is stable!

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

        conn.on('error', (err) => {
            console.error("Connection error:", err);
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
            call.on('close', () => {
                setRemoteStream(null);
            });
            call.on('error', (err) => {
                console.error("Call error:", err);
                setRemoteStream(null);
            });
        }
    };

    const broadcast = (data) => {
        connections.forEach(conn => conn.send(data));
    };

    return { peerId, connectToPeer, broadcast, remoteStream };
}
