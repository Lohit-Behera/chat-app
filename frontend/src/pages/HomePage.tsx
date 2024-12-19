import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchGetAllUser } from "@/features/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <div className="flex space-x-4 p-4 rounded-lg border ">
      <div className="grid gap-4">
        {getAllUser.map((item) => (
          <>
            {item._id !== userDetails._id && (
              <div
                key={item._id}
                className="flex items-center space-x-2 rounded-md bg-muted p-2 cursor-pointer"
              >
                <Avatar className="my-auto">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p>{item.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.fullName}
                  </p>
                </div>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
