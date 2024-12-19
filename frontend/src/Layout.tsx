import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "./components/Header";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store/store";
import { fetchUserDetails } from "./features/userSlice";

function Layout() {
  const dispatch = useDispatch<AppDispatch>();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  const userDetailsStatus = useSelector(
    (state: RootState) => state.user.userDetailsStatus
  );

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchUserDetails());
    }
  }, []);
  return (
    <div className="w-full min-h-[100vh] flex flex-col justify-center items-center">
      {userDetailsStatus === "loading" ? (
        <p>Loading</p>
      ) : userDetailsStatus === "failed" ? (
        <p>Error</p>
      ) : userDetailsStatus === "succeeded" || userDetailsStatus === "idle" ? (
        <>
          <Header />
          <main className="w-full flex-1 flex justify-center items-center my-6">
            <Outlet />
            <ScrollRestoration />
          </main>
        </>
      ) : null}
    </div>
  );
}
export default Layout;
