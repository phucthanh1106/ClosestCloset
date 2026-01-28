import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import ItemCard from "./ItemCard.jsx";
import AddPhotoButton from "./AddPhotoButton.jsx";

export default function CategoryGrid() {
  const [items, setItems] = useState([]); // state to hold items in this category
  const [categoryId, setCategoryId] = useState(null);
  const { categoryName } = useParams(); // reads the dynamic part of URL

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/categories/${categoryName}`);

      if (response.status === 200) {
        setCategoryId(response.data.category._id);
        setItems(response.data.items); // Axios uses .data as the consistent "bucket" for whatever your backend sent back in res.json()
      }
    } catch (err) {
      console.error("Failed to fetch images: ", err);
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`/api/categories/${categoryName}`);

        if (response.status === 200) {
          setCategoryId(response.data.category._id);
          setItems(response.data.items); // Axios uses .data as the consistent "bucket" for whatever your backend sent back in res.json()
        }
      } catch (err) {
        console.error("Failed to fetch images: ", err);
      }
    }
    fetchItems();
  }, [categoryName]);


  // Handle adding new image to the category
  const handleAddItem = async (newFile) => {
    if (!newFile) return;

    try {
      const response = await axios.post(`/api/categories/${categoryName}`, {
            myFile: newFile,
            category: categoryId, // This comes from your fetchCategory useEffect
            description: "",      // Initial empty values
            brand: "",
            hasInfo: false
        });


      const savedItem = response.data;
      if (response.status === 200) {
        setItems((prevItems) => [...prevItems, savedItem]);
      } 
    } catch (err) {
      console.error("Failed to add image to database:", err);
      alert("Upload failed. Is the file too large?");
    }
  }

  // Removing an image
  const handleDeleteItem = (itemDelete) => {
    setItems((prevItems) => {
      const currentCategoryItems = prevItems[categoryName] || [];
      return {
        ...prevItems,
        [categoryName]: currentCategoryItems.filter(item => item.id !== itemDelete.id),
      };
    })
  }

  // Save the form info for an item
  const handleSaveItemInfo = (updatedItem) => {
    setItems((prevItems) => {
      const currentCategoryItems = prevItems[categoryName] || [];
      return {
        ...prevItems,
        [categoryName]: currentCategoryItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      };
    })
  }


  return (
    <div className="w-full flex flex-col items-center pt-5">
      {/* Category name */}
      <h1 className="text-center text-white text-5xl font-inherit pt-5 font-inherit">{categoryName.replace(/-/g, " ")}</h1>

      {/* Add Photo Button */}
      <div className="flex justify-center mt-5">
        <AddPhotoButton addItem={handleAddItem} />
      </div>

      {/* Cards container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-items-center mt-7 mb-7">
        {items.map((item) => (
          <div>
            <ItemCard key={item._id} item={item} image={item.myFile} onDelete={handleDeleteItem} onSave={handleSaveItemInfo}/>
          </div>
        ))  
        }
      </div>

    </div>
  );
}