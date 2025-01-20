import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";
import { motion } from "motion/react";
interface CallingDialogProps {
  callingTo: {
    id: string;
    username: string;
    avatar: string;
  };
  openDialog: boolean;
  handleCallCancel: () => void;
}

function CallDialog({
  callingTo,
  openDialog,
  handleCallCancel,
}: CallingDialogProps) {
  return (
    <Dialog open={openDialog}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center space-y-6 py-8">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={callingTo.avatar} />
              <AvatarFallback>
                {callingTo.username ? callingTo.username[0] : "A"}
              </AvatarFallback>
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
          <p className="text-lg">{callingTo.username}</p>

          {/* Cancel Button */}
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={handleCallCancel}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default CallDialog;
