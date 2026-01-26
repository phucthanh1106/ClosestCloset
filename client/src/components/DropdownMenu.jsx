import { useEffect } from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function DropdownMenu({ label, items, addBool, basePath }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [categories, setCategories] = useState(items);

    // Use location to detect where the user is
    const location = useLocation();

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");

                if (!res.ok) {
                    throw new Error("Failed to fetch categories");
                }
                
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error("Error fetching cateogories")
            }
        };

        fetchCategories();
    }, []);

    // Function to add a new category to the dropdown menu
    const addCategory = async () => {
        const newCategory = prompt("Enter a new category name:");

        // Check for existed duplicates
        const exists = categories.some(
            (category) => category.name.toLowerCase() === newCategory.toLowerCase()
        );

        if (exists) {
            alert("This category already exists");
            return;
        }

        // Sending new category to db
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory }),
            });

            const createdCategory = await response.json();

            // Check conditions of the response
            if (response.ok) {
                setCategories([...categories, createdCategory]);
            } else {
                throw new Error("Failed to save category");
            }
        } catch (err) {
            console.error("Error adding category", err);
        }
    }

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    console.log(categories);


    return (
        <div>
            {/* Handle the button toggling instead of going to my closet every time */}
            {location.pathname === "/" 
            ? <Link to="/my-closet"><button className="dropdown-button" onClick={toggleDropdown}>{label}</button></Link>
            : <button className="dropdown-button" onClick={toggleDropdown}>{label}</button>
            }

            {showDropdown && (
                <ul className="dropdown-menu">
                    {categories.map((item) => (
                        <li key={item._id}>
                            <Link 
                                className="dropdown-item" 
                                to={`${basePath}/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}

                    {addBool && <button className="dropdown-add-btn" onClick={addCategory}>➕</button>}
                </ul>
            )}
        </div>
    );

}