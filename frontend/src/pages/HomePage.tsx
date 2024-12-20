import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchGetAllUser } from "@/features/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Chat from "@/components/Chat";

function HomePage() {
  const dispatch = useDispatch<AppDispatch>();

  const userDetails = useSelector(
    (state: RootState) => state.user.userDetails.data
  );

  const getAllUser = useSelector(
    (state: RootState) => state.user.getAllUser.data
  );

  useEffect(() => {
    dispatch(fetchGetAllUser());
  }, []);

  return (
    <div className="flex space-x-4 p-4 rounded-lg border w-[95%] min-h-[80vh]">
      <div className="flex flex-col gap-4 w-1/5 p-2 rounded-md border ">
        {getAllUser.map((item) => (
          <div
            key={item._id}
            className="flex items-center space-x-2 rounded-md bg-muted p-2 cursor-pointer"
          >
            <Avatar className="my-auto w-12 h-12">
              <AvatarImage src={item.avatar} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>{item.username}</p>
              <p className="text-xs text-muted-foreground">
                {item.status ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-4/5 p-2 rounded-md border ">
        <Chat />
      </div>
    </div>
  );
}

export default HomePage;
