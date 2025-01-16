import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Button } from "./ui/button";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

interface CallProps {
  socket: Socket;
  receiverId: string;
  userId: string;
  isInitiator: boolean; // Add this to track who started the call
  onEndCall: () => void;
}

const Call = ({
  socket,
  receiverId,
  userId,
  isInitiator,
  onEndCall,
}: CallProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Create peer connection
        const configuration = {
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        };
        peerConnectionRef.current = new RTCPeerConnection(configuration);

        // Get local stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Add tracks to peer connection
        stream.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, stream);
          }
        });

        // Set up peer connection handlers
        if (peerConnectionRef.current) {
          peerConnectionRef.current.ontrack = (event) => {
            console.log("Received remote track");
            if (remoteVideoRef.current && event.streams[0]) {
              remoteVideoRef.current.srcObject = event.streams[0];
              setRemoteStream(event.streams[0]);
            }
          };

          peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                candidate: event.candidate,
                receiverId,
              });
            }
          };

          // If initiator, create and send offer
          if (isInitiator) {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socket.emit("offer", { offer, receiverId });
          }
        }
      } catch (err) {
        console.error("Error initializing call:", err);
      }
    };

    initializeCall();

    return () => {
      // Cleanup
      localStream?.getTracks().forEach((track) => track.stop());
      peerConnectionRef.current?.close();
    };
  }, [isInitiator]);

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket || !peerConnectionRef.current) return;

    socket.on("offer", async ({ offer }) => {
      if (!peerConnectionRef.current) return;

      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", { answer, receiverId });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on("answer", async ({ answer }) => {
      try {
        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("Error handling ICE candidate:", err);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const handleEndCall = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    socket.emit("end-call", { receiverId });
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-background/95 flex flex-col items-center justify-center z-50">
      <div className="relative w-full max-w-4xl aspect-video p-4">
        {/* Remote Video (Large) */}
        <div className="w-full bg-muted rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Local Video (Small) */}
        <div className="absolute bottom-6 right-6 border-2 bg-muted rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-40 h-40 object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-4">
        <Button
          variant={isAudioMuted ? "destructive" : "default"}
          size="icon"
          onClick={toggleAudio}
        >
          {isAudioMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button
          variant={isVideoOff ? "destructive" : "default"}
          size="icon"
          onClick={toggleVideo}
        >
          {isVideoOff ? <VideoOff /> : <Video />}
        </Button>
        <Button variant="destructive" size="icon" onClick={handleEndCall}>
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
};

export default Call;
