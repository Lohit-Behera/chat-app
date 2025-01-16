import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Phone, Video } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Socket } from "socket.io-client";
import { fetchReceiverDetails } from "@/features/userSlice";
import { fetchGetMessages } from "@/features/messageSlice";
import { debounce } from "@/lib/debounce";
import MessageLoading from "./message-loading";
import Call from "./Call";
import CallNotification from "./CallNotification";
import CallingDialog from "./CallingDialog";
import { toast } from "sonner";

interface ChatProps {
  socket: Socket;
  receiverId: string;
}

function Chat({ socket, receiverId }: ChatProps) {
  const dispatch = useDispatch<AppDispatch>();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [allMessage, setAllMessage] = useState<any[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isCallInitiator, setIsCallInitiator] = useState(false);

  const userDetails = useSelector(
    (state: RootState) => state.user.userDetails.data
  );
  const roomId = [userDetails._id, receiverId].sort().join("_");
  const receiverDetails = useSelector(
    (state: RootState) => state.user.receiverDetails.data
  );
  const getMessage = useSelector(
    (state: RootState) => state.message.getMessage.data
  );
  const getMessageStatus = useSelector(
    (state: RootState) => state.message.getMessageStatus
  );

  // fetch receiver details and get messages
  useEffect(() => {
    if (receiverId) {
      dispatch(fetchReceiverDetails(receiverId));
      dispatch(fetchGetMessages(receiverId));

      socket.emit("join", `${roomId}`);
    }
  }, [receiverId]);

  // set fetched messages
  useEffect(() => {
    if (getMessageStatus === "succeeded") {
      setAllMessage(getMessage.docs);
    }
  }, [getMessageStatus]);

  // Scroll to the bottom when messages are updated
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [allMessage, typingUser]);

  // receive message
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setAllMessage((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  // send message
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        sender: userDetails._id,
        message,
        receiver: receiverDetails._id,
        time: new Date().toLocaleTimeString(),
      };

      // Emit the message to the server
      socket.emit("send_message", newMessage);
      setMessage("");
    }
  };

  // User Status
  useEffect(() => {
    socket.on("status_update", (data: { userId: string }) => {
      console.log(
        "A user's status has changed in the chat, re-fetching user data...",
        data.userId
      );
      console.log(data.userId, receiverId, data.userId === receiverId);

      if (data.userId === receiverId) {
        dispatch(fetchReceiverDetails(receiverId));
      }
    });

    return () => {
      socket.off("status_update");
    };
  }, [socket, dispatch, receiverId]);

  // Typing Indicator
  const handleTyping = (() => {
    const debouncedStopTyping = debounce(() => {
      socket.emit("stop_typing", roomId, userDetails._id);
    }, 3000);

    return () => {
      socket.emit("typing", roomId, userDetails._id);
      debouncedStopTyping(); // Start debounce timer
    };
  })();

  useEffect(() => {
    socket.on("is_typing", (userId: string) => {
      if (userId !== userDetails._id) {
        setTypingUser(userId);
        console.log(typingUser);
      }
    });

    socket.on("stopped_typing", (userId: string) => {
      if (userId === typingUser) {
        setTypingUser(null);
      }
    });

    return () => {
      socket.off("is_typing");
      socket.off("stopped_typing");
    };
  }, [socket, userDetails._id, typingUser]);

  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", (data) => {
      console.log("Received incoming call:", data);
      setIncomingCall({
        id: data.callerId,
        username: data.callerName,
        avatar: data.callerAvatar,
        isVideo: data.isVideo,
      });
    });

    socket.on("call-failed", (data) => {
      console.log("Call failed:", data);
      // Show an error message to the user
      // You can use your preferred toast/notification system
      toast.info(`Unable to reach user. They may be offline.`);
    });

    socket.on("call-rejected", () => {
      // Handle call rejection
      console.log("Call was rejected");
    });

    socket.on("call-accepted", () => {
      setIsInCall(true);
    });

    socket.on("call-ended", () => {
      setIsInCall(false);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-failed");
      socket.off("call-rejected");
      socket.off("call-accepted");
      socket.off("call-ended");
    };
  }, [socket]);

  // Add these handler functions
  const handleStartCall = (isVideo: boolean) => {
    if (!receiverDetails.online) {
      toast.error("User is offline");
      return;
    }

    setIsCalling(true);
    setIsCallInitiator(true);

    socket.emit("start-call", {
      receiverId,
      callerName: userDetails.username,
      callerAvatar: userDetails.avatar,
      isVideo,
    });
  };

  const handleAcceptCall = () => {
    setIsInCall(true);
    setIsCallInitiator(false);
    socket.emit("accept-call", { callerId: incomingCall.id });
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    socket.emit("reject-call", { callerId: incomingCall.id });
    setIncomingCall(null);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("call-accepted", () => {
      setIsCalling(false);
      setIsInCall(true);
    });

    socket.on("call-rejected", () => {
      setIsCalling(false);
      setIsCallInitiator(false);
      toast.error("Call was rejected");
    });

    socket.on("call-failed", () => {
      setIsCalling(false);
      setIsCallInitiator(false);
      toast.error("Call failed to connect");
    });

    socket.on("call-ended", () => {
      setIsInCall(false);
      setIsCallInitiator(false);
    });

    return () => {
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-failed");
      socket.off("call-ended");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    if (incomingCall) {
      socket.on("call-cancelled", () => {
        setIncomingCall(null);
      });
    }
  });

  return (
    <div className="flex flex-col">
      {receiverId ? (
        <>
          <header className="bg-muted/50 p-2 rounded-t-md flex space-x-1">
            <div className="w-12 h-12 relative">
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 ${
                  receiverDetails.online ? "bg-green-500" : "bg-red-500"
                } border-2 border-white rounded-full z-10`}
              ></span>
              <Avatar className="w-12 h-12">
                <AvatarImage src={receiverDetails.avatar} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <p>{receiverDetails.username}</p>
              <p className="text-xs text-muted-foreground">
                {receiverDetails.online ? "Online" : "Offline"}
              </p>
            </div>
            {/* Call Controls */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStartCall(false)}
                disabled={!receiverDetails.online}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStartCall(true)}
                disabled={!receiverDetails.online}
              >
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <div className="relative flex flex-col space-y-2">
            {isInCall && (
              <Call
                socket={socket}
                receiverId={receiverId}
                userId={userDetails._id}
                isInitiator={isCallInitiator}
                onEndCall={() => {
                  setIsInCall(false);
                  setIsCallInitiator(false);
                }}
              />
            )}

            {incomingCall && (
              <CallNotification
                socket={socket}
                caller={incomingCall}
                onAccept={handleAcceptCall}
                onReject={handleRejectCall}
              />
            )}
            {isCalling && (
              <CallingDialog
                receiver={receiverDetails}
                onCancel={() => {
                  socket.emit("cancel-call", { receiverId });
                  setIsCalling(false);
                  setIsCallInitiator(false);
                }}
                isVideo={true}
              />
            )}
            <ScrollArea className="h-[70vh]" ref={messagesContainerRef}>
              <div className="w-[98%] h-full flex flex-col space-y-2 mb-2">
                <AnimatePresence>
                  {allMessage.map((item, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                      transition={{
                        opacity: { duration: 0.1 },
                        layout: {
                          type: "spring",
                          bounce: 0.3,
                          duration: index * 0.05 + 0.4,
                        },
                      }}
                      style={{ originX: 0.5, originY: 0.5 }}
                      key={index}
                      className={`flex space-x-1 ${
                        item.sender === userDetails._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 max-w-[60%] ${
                          item.sender === userDetails._id
                            ? "bg-primary text-primary-foreground rounded-l-xl rounded-tr-xl"
                            : "bg-secondary text-secondary-foreground rounded-r-xl rounded-tl-xl"
                        }`}
                      >
                        <p className="break-words max-w-full whitespace-pre-wrap">
                          {item.message}
                        </p>
                        <p
                          className={`text-xs ${
                            item.sender !== userDetails._id &&
                            "text-muted-foreground"
                          } text-right`}
                        >
                          {item.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {/* Typing Indicator */}
                  {typingUser && (
                    <div className="flex justify-center w-14 p-2 bg-muted rounded-r-xl rounded-tl-xl">
                      <MessageLoading />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
            <div className="sticky bottom-0 w-full flex space-x-2">
              <Input
                placeholder="Type a message..."
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                value={message}
              />
              <Button size="icon" onClick={sendMessage}>
                <Send />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Select a user to start a conversation
        </p>
      )}
    </div>
  );
}

export default Chat;
