import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function DropdownMenu({ label, items, addBool, basePath }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [categories, setCategories] = useState(items);

    // Use location to detect where the user is
    const location = useLocation();

    // Function to add a new category to the dropdown menu
    const addCategory = () => {
        const newCategory = prompt("Enter a new category name:");
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
        }
    }

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

    return (
        <div>
            {/* Handle the button toggling instead of going to my closet every time */}
            {location.pathname === "/" 
            ? <Link to="/my-closet"><button className="dropdown-button" onClick={toggleDropdown}>{label}</button></Link>
            : <button className="dropdown-button" onClick={toggleDropdown}>{label}</button>
            }

            {showDropdown && (
                <ul className="dropdown-menu">
                    {categories.map((item, index) => (
                        <li key={index}>
                            <Link 
                                className="dropdown-item" 
                                to={`${basePath}/${item.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                                {item}
                            </Link>
                        </li>
                    ))}

                    {addBool && <button className="dropdown-add-btn" onClick={addCategory}>➕</button>}
                </ul>
            )}
        </div>
    );

}