import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import Logo from "@/assets/Logo.svg";

function Header() {
  return (
    <header className="z-20 w-full sticky top-0 p-2 backdrop-blur bg-background/50">
      <nav className="flex justify-between space-x-2">
        <Link to={"/"} className="text-lg font-bold">
          <img src={Logo} alt="logo" className="w-10 h-10" />
        </Link>
        <div>
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}

export default Header;
