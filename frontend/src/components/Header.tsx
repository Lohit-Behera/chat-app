import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchLogout } from "@/features/userSlice";
import { ModeToggle } from "./mode-toggle";
import Logo from "@/assets/Logo.svg";
import { Button } from "./ui/button";

function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  return (
    <header className="z-20 w-full sticky top-0 p-2 backdrop-blur bg-background/50">
      <nav className="flex justify-between space-x-2">
        <Link to={"/"} className="text-lg font-bold">
          <img src={Logo} alt="logo" className="w-10 h-10" />
        </Link>
        <div className="flex space-x-2">
          {userInfo && (
            <Button
              onClick={() => dispatch(fetchLogout())}
              variant={"destructive"}
            >
              Logout
            </Button>
          )}
          {!userInfo && (
            <NavLink to="/login">
              {({ isActive }) => (
                <Button variant={isActive ? "default" : "ghost"} size="sm">
                  Login
                </Button>
              )}
            </NavLink>
          )}
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}

export default Header;
