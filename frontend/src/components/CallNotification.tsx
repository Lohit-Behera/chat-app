import { useState } from "react";
import { Socket } from "socket.io-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Phone, PhoneOff } from "lucide-react";

interface CallNotificationProps {
  socket: Socket;
  caller: {
    id: string;
    username: string;
    avatar: string;
  };
  onAccept: () => void;
  onReject: () => void;
}

const CallNotification = ({
  socket,
  caller,
  onAccept,
  onReject,
}: CallNotificationProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleAccept = () => {
    setIsOpen(false);
    onAccept();
  };

  const handleReject = () => {
    setIsOpen(false);
    onReject();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Incoming Call</DialogTitle>
          <DialogDescription>
            {caller.username} is calling you
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <img
            src={caller.avatar}
            alt={caller.username}
            className="w-20 h-20 rounded-full"
          />
        </div>
        <DialogFooter className="flex justify-center gap-4">
          <Button
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600"
            size="icon"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button onClick={handleReject} variant="destructive" size="icon">
            <PhoneOff className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CallNotification;
