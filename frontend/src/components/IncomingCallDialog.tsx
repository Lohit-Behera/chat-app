import { useEffect, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface CallNotificationProps {
  socket: Socket;
}

function IncomingCallDialog({ socket }: CallNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [caller, setCaller] = useState<{
    id: string;
    username: string;
    avatar: string;
  }>({ id: "", username: "", avatar: "" });

  const userDetails = useSelector(
    (state: RootState) => state.user.userDetails.data
  );

  useEffect(() => {
    socket.on("incoming_call", (data) => {
      setIsOpen(true);
      setCaller({
        id: data.callingFrom,
        username: data.name,
        avatar: data.avatar,
      });
    });
    socket.on("call_canceled", (data) => {
      setIsOpen(false);
      toast.error(`Call Canceled by ${data.name}`);
    });
    socket.on("call_rejected", () => {
      setIsOpen(false);
    });
    return () => {
      socket.off("incoming_call");
      socket.off("call_canceled");
    };
  }, [socket]);

  const handleAccept = () => {
    setIsOpen(false);
    socket.emit("call_accept", {
      callingFrom: caller.id,
      name: userDetails.username,
    });
  };

  const handleReject = () => {
    setIsOpen(false);
    socket.emit("call_reject", {
      callingFrom: caller.id,
      name: userDetails.username,
    });
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
        <div className="flex justify-center my-8">
          <Avatar className="w-20 h-20">
            <AvatarImage src={caller.avatar} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <DialogFooter className="flex flex-row justify-center gap-4">
          <Button
            onClick={handleAccept}
            className="h-12 w-12 bg-green-500 hover:bg-green-600 rounded-full"
            size="icon"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleReject}
            variant="destructive"
            className="h-12 w-12 rounded-full"
            size="icon"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default IncomingCallDialog;
