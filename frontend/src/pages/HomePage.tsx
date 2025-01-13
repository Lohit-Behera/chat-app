import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchGetAllUser } from "@/features/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Chat from "@/components/Chat";
import { io, Socket } from "socket.io-client";

function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [receiverId, setReceiverId] = useState<string>("");

  const userDetails = useSelector(
    (state: RootState) => state.user.userDetails.data
  );

  const getAllUser = useSelector(
    (state: RootState) => state.user.getAllUser.data
  );

  useEffect(() => {
    dispatch(fetchGetAllUser());
  }, []);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(
      import.meta.env.VITE_BASE_URL || "http://localhost:8000",
      {
        query: { userId: userDetails?._id },
      }
    );

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [userDetails]);

  // Re-fetch user data when a user's status changes
  useEffect(() => {
    if (!socket) return;
    socket.on("status_update", (userId: string) => {
      // Re-fetch user data with userId if needed
      console.log(
        "A user's status has changed, re-fetching user data...",
        userId
      );
      dispatch(fetchGetAllUser());
    });

    return () => {
      socket.off("status_update");
    };
  }, [socket, dispatch]);

  return (
    <div className="flex space-x-4 p-4 rounded-lg border w-[95%] min-h-[80vh]">
      <div className="flex flex-col gap-4 w-1/5 p-2 rounded-md border ">
        {getAllUser.map((item) => (
          <div
            key={item._id}
            className="flex items-center space-x-2 rounded-md bg-muted p-2 cursor-pointer"
            onClick={() => setReceiverId(item._id)}
          >
            <div className="w-12 h-12 relative">
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 ${
                  item.online ? "bg-green-500" : "bg-red-500"
                } border-2 border-white rounded-full z-10`}
              ></span>
              <Avatar className="my-auto w-12 h-12">
                <AvatarImage src={item.avatar} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <p>{item.username}</p>
              <p className="text-xs text-muted-foreground">
                {item.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-4/5 p-2 rounded-md border ">
        {socket && <Chat socket={socket} receiverId={receiverId} />}
      </div>
    </div>
  );
}

export default HomePage;
