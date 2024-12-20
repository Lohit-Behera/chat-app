import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function Chat() {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [allMessage, setAllMessage] = useState<string[]>([]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [allMessage]);
  const userDetails = useSelector(
    (state: RootState) => state.user.userDetails.data
  );
  return (
    <div className="flex flex-col">
      <header className="bg-muted/50 p-2 rounded-t-md flex space-x-1">
        <div className="w-12 h-12 relative">
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></span>
          <Avatar className="w-12 h-12">
            <AvatarImage src={userDetails.avatar} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <p>{userDetails.username}</p>
          <p className="text-xs text-muted-foreground">
            {userDetails.status ? "Online" : "Offline"}
          </p>
        </div>
      </header>
      <div className="relative flex flex-col space-y-2">
        <ScrollArea className="h-[70vh]" ref={messagesContainerRef}>
          <div className="w-[98%] h-full flex flex-col space-y-2">
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
                  key={item._id}
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
            </AnimatePresence>
          </div>
        </ScrollArea>
        <div className="sticky bottom-0 w-full flex space-x-2">
          <Input
            placeholder="Type a message..."
            onChange={(e) => setMassage(e.target.value)}
            value={massage}
          />
          <Button size="icon">
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
