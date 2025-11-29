import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function DropdownMenu({ label, items, addBool, basePath }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [categories, setCategories] = useState(items);

    // Use location if needed in future enhancements
    const location = useLocation();

    const addCategory = () => {
        const newCategory = prompt("Enter new category name:");
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
        }
    }

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

    return (
        <div>
            {location.pathname === "/" ? 
            <Link to="/my-closet"><button className="dropdown-button" onClick={toggleDropdown}>{label}</button></Link>
            : <button className="dropdown-button" onClick={toggleDropdown}>{label}</button>
            }

            {showDropdown && (
                <ul className="dropdown-menu">
                    {categories.map((item, index) => (
                        <li><Link to={`${basePath}/${item.toLowerCase().replace(/\s+/g, "-")}`} className="dropdown-content">{item}</Link></li>
                    ))}

                    {addBool && <button className="dropdown-add-btn" onClick={addCategory}>➕</button>}
                </ul>
            )}
        </div>
    );

}