import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { useLogout } from "../hooks/useLogout.js"
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../hooks/useAuthContext.js"

export default function Navbar() {
    const { logout } = useLogout();
    const { user } = useAuthContext();
    const navigate = useNavigate();
    
    const handleClick = () => {
        logout();
        navigate("/login");
    }

    return <nav className="nav">
        {/* Left side of nav bar */}
        <ul class="nav-items">
            <li><DropdownMenu label="My Closet" items={[]} addBool={true} basePath="my-closet"></DropdownMenu></li>
        </ul>

        {/* Middle part (title) of nav bar */}
        <CustomLink to="/" className="nav-title">ClosestCloset</CustomLink> 

        {/* Right side of nav bar */}
        <ul class="nav-items">
            {/* When the user is logged in */}
            {user && (
                <>
                {/* <li><CustomLink to="/about">About</CustomLink></li> */}
                <li>{user.email}</li>
                <li>
                    <button 
                        onClick={handleClick}
                        className="px-4 py-1.5 rounded-md border border-[oklch(87.1%_0.15_154.449)]
                                font-medium
                                text-[oklch(87.1%_0.15_154.449)] hover:bg-white/20
                                transition-all duration-300"
                        style={{ lineHeight: '1' }} // Prevents text from shifting inside the box
                    >
                        Log out
                    </button>
                </li>
                </>
            )}
            {/* <li><button>Search</button></li> */}

            {/* When the user hasn't logged in */}
            {!user && (
                <>
                    <li><CustomLink to="/login">Sign in</CustomLink></li>
                    {/* <li><CustomLink to="/about">About</CustomLink></li> */}
                </>
            )}
        </ul>
    </nav>
}

function CustomLink({ to, children, ...props }) {
    return (
            <Link to={to} {...props}>{children}</Link>
    )
}