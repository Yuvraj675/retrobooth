import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

export function usePeer(localStream, onDataReceived) {
    const [peerId, setPeerId] = useState('');
    const [connections, setConnections] = useState([]);
    const [peerError, setPeerError] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerRef = useRef(null);
    const connectionsRef = useRef([]);

    useEffect(() => {
        connectionsRef.current = connections;
    }, [connections]);

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
                    { urls: 'stun:stun.services.mozilla.com' },
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
            setPeerError(err);
        });

        peer.on('connection', (conn) => {
            console.log("Incoming connection from:", conn.peer);

            // 1. Capacity Check (Host side)
            if (connectionsRef.current.length >= 1) {
                console.warn("Room full! Rejecting from:", conn.peer);
                conn.on('open', () => {
                    conn.send({ type: 'ERROR', payload: 'ROOM_FULL' });
                    setTimeout(() => conn.close(), 500);
                });
                return;
            }

            handleConnection(conn);
        });

        peer.on('call', (call) => {
            console.log("Receiving call from:", call.peer);

            // Capacity check for calls
            if (connectionsRef.current.length >= 1 && !connectionsRef.current.find(c => c.peer === call.peer)) {
                console.warn("Room full! Rejecting call.");
                return;
            }

            const answerCall = () => {
                const currentStream = streamRef.current;
                if (currentStream) {
                    call.answer(currentStream);
                    setupCallListeners(call);
                } else {
                    console.log("Stream not ready, waiting...");
                    setTimeout(answerCall, 200); // Retry every 200ms
                }
            };

            // Helper to attach listeners to avoid duplication
            const setupCallListeners = (activeCall) => {
                activeCall.on('stream', (stream) => {
                    console.log("Received remote stream");
                    setRemoteStream(stream);
                });

                activeCall.on('close', () => {
                    console.log("Call closed");
                    setRemoteStream(null);
                });

                activeCall.on('error', (err) => {
                    console.error("Call error:", err);
                    setRemoteStream(null);
                });
            }

            answerCall();
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
        setPeerError(null);

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

    return { peerId, connectToPeer, broadcast, remoteStream, connections, peerError };
}
