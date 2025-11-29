import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";

export default function Navbar() {
    return <nav className="nav">
        {/* Left side of nav bar */}
        <ul class="nav-items">
            <li><DropdownMenu label="My Closet" items={[]} addBool={true} basePath="my-closet"></DropdownMenu></li>
        </ul>

        {/* Middle part (title) of nav bar */}
        <CustomLink to="/" className="nav-title">ClosestCloset</CustomLink> 

        {/* Right side of nav bar */}
        <ul class="nav-items">
            <li><button>Search</button></li>
            <CustomLink to="/about">About</CustomLink>
        </ul>
    </nav>
}

function CustomLink({ to, children, ...props }) {
    return (
        <li>
            <Link to={to} {...props}>{children}</Link>
        </li>
    )
}