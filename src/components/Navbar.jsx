export default function Navbar() {
    return <nav className="nav">
        <a href="/" className="site-title">ClosestCloset</a>
        <ul>
            <li>
                <a href="/about">About</a>
            </li>
            <li>
                <a href="my-closet">My Closet</a>
            </li>
        </ul>
    </nav>
}