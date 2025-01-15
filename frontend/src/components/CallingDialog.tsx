// CallingDialog.tsx
import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { motion } from "motion/react";
import BinksSake from "@/assets/BinksSake.mp3";

interface CallingDialogProps {
  receiver: {
    username: string;
    avatar: string;
  };
  onCancel: () => void;
  isVideo: boolean;
}

const CallingDialog = ({ receiver, onCancel, isVideo }: CallingDialogProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Play ringing sound
    if (audioRef.current) {
      audioRef.current.play();
      audioRef.current.loop = true;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center space-y-6 py-8">
          {/* Audio Element */}
          <audio ref={audioRef} src="/BinksSake.mp3" />

          {/* Status Text */}
          <h2 className="text-xl font-semibold">
            {isVideo ? "Video Calling" : "Calling"}...
          </h2>

          {/* Avatar with Ripple Effect */}
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={receiver.avatar} />
              <AvatarFallback>{receiver.username[0]}</AvatarFallback>
            </Avatar>

            {/* Ripple Animations */}
            {[1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="absolute inset-0 rounded-full border-4 border-primary/50"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.4,
                }}
              />
            ))}
          </div>

          {/* Receiver Name */}
          <p className="text-lg">{receiver.username}</p>

          {/* Cancel Button */}
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={onCancel}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallingDialog;
