import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext.js"


export default function DropdownMenu({ label, items, addBool, basePath }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [categories, setCategories] = useState(items);
    const { user } = useAuthContext();
    const navigate = useNavigate();

    // Use location to detect where the user is
    const location = useLocation();

    // Fetch categories
    useEffect(() => {
        if (location.pathname === "/") {
            setShowDropdown(false);
        }
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories", {
                    headers: {
                        "Authorization": `Bearer ${user.token}`
                    }
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch categories");
                }
                
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error("Error fetching cateogories")
            }
        };

        if (user) {
            fetchCategories();
        }
    }, [user, location.pathname]);

    // Function to add a new category to the dropdown menu
    const addCategory = async () => {
        let newCategory = prompt("Enter a new category name with less than 25 characters: ");
        newCategory = newCategory.replace(/[\\/]/g, "");

        while (newCategory.length > 25) {
            alert("Category name can't be more than 25 characters");
            newCategory = prompt("Enter a new category name with less than 25 characters: ");
        }

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
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ 
                    name: newCategory,
                    userId: user.id,
                }),
            });

            const createdCategory = await response.json();

            // Check conditions of the response
            if (response.ok) {
                setCategories([...categories, createdCategory]);
                navigate(`/${user.id}/${createdCategory._id}`);
            } else {
                throw new Error("Failed to save category");
            }
        } catch (err) {
            console.error("Error adding category", err);
        }
    };

    // Function to handle delete a category
    const deleteCategory = async (catId, e) => {
        const endpoint = `/api/categories/${catId}`; // IMPORTANT!!!!: Use `` as "" and '' are just plain strings
        // Check for user's confirmation first
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        
        try {
            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });

            // Check conditions of the response
            if (response.ok) {
                setCategories(((prev) => prev.filter((cat) => cat._id !== catId)));

                // Navigate the user back to the main page
                navigate("/my-closet");
            } else {
                const errorMessage = await response.json();
                console.error(errorMessage);
                alert("Could not delete category");
            }
        } catch (err) {
            console.error("Delete request failed: ", err);
            alert("Couldn't delete the category, check your connection!");
        }
    };

    const toggleDropdown = () => {
        if (location.pathname === "/") {
            navigate(`/${user.id}`);
        }
        
        if (user) {
            setShowDropdown(!showDropdown);
        }
    };

    
    return (
        <div>
            {/* Handle the button toggling instead of going to my closet every time */}
            {/* {location.pathname === "/" && user
            ? <Link to="/my-closet"><button className="dropdown-button" onClick={toggleDropdown}>{label}</button></Link>
            : <button className="dropdown-button" onClick={toggleDropdown}>{label}</button>
            } */}
            <button className="dropdown-button" onClick={toggleDropdown}>{label}</button>

            {showDropdown && user && (
                <ul className="dropdown-menu">
                    {categories.map((item) => (
                        <li key={item._id} className="group relative flex items-center justify-between w-full">
                            <Link 
                                className="dropdown-item pr-12 font-nerko" 
                                to={`${basePath}/${item._id.toString()}`}
                            >
                                {item.name}
                            </Link>

                            {/* The "X" Button */}
                            <button 
                                onClick={(e) => deleteCategory(item._id, e)}
                                className="absolute right-0 opacity-0 group-hover:opacity-100 text-gray-800 hover:text-black hover:font-bold px-2 transition-opacity duration-200"
                            >
                                ✕ 
                            </button>
                        </li>
                    ))}

                    {addBool && <button className="dropdown-add-btn" onClick={addCategory}>➕</button>}
                </ul>
            )}
        </div>
    );
}
