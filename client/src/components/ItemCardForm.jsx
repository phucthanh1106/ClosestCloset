import { useForm } from "react-hook-form";
import { useAuthContext } from "../hooks/useAuthContext.js";

export default function ItemCardForm({ item, onClose, onSave }) {
    const { user } = useAuthContext();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            description: item.description || "",
            brand: item.brand || "",
            url: item.url || "",
            notes: item.notes || "",
            hasInfo: item.hasInfo
        }
    });


    // handleSubmit handles the form; onSubmit handles your app logic
    // data is an object whose keys are the names you passed to register, and whose values are the current input values
    const onSubmit = async (data) => {
        try {
            const updatedItem = {
                ...item,
                ...data,
                hasInfo: true
            };

            const categoryId = item.category.toString();
            const itemId = item._id;

            const response = await fetch(`/api/categories/${categoryId}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', // Required for the server to "see" your data
                    "Authorization": `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    file: item.file,
                    category: categoryId, 
                    description: data.description,      
                    brand: data.brand,
                    url: data.url,
                    notes: data.notes,
                    hasInfo: true
                }),
            })

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            onSave(updatedItem);
            onClose();
        } catch (err) {
            console.error("Failed to save item's info to database:", err);
            alert("Save info failed!");
        }
    }

    
    return (
        /* BACKDROP */
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blur + dark overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* MODAL */}
            <div className="relative z-10 w-full max-w-md rounded-xl p-6 bg-white/30 backdrop-blur-lg border border-white/30 shadow-xl">
                {/* <h3 className="text-lg font-bold mb-4">Item Details</h3> */}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                        Description
                        </label>
                        <input
                        {...register("description", {
                            required: "Description is required",
                            maxLength: {
                            value: 40,
                            message: "Description must be at most 40 characters"
                            }                    
                        })}
                        className="w-full p-2 border rounded text-sm"
                        />
                        {errors.description && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.description.message}
                        </p>
                        )}
                    </div>

                    {/* Brand */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                        Brand
                        </label>
                        <input
                        {...register("brand")}
                        className="w-full p-2 border rounded text-sm"
                        />
                    </div>

                    {/* url */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                        URL
                        </label>
                        <input
                        type="url"
                        {...register("url", {
                            pattern: {
                            value: /^https?:\/\/.+/i,
                            message: "Must be a valid URL"
                            }
                        })}
                        className="w-full p-2 border rounded text-sm"
                        />
                        {errors.url && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.url.message}
                        </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                        Notes
                        </label>
                        <textarea
                        {...register("notes")}
                        rows="3"
                        className="w-full p-2 border rounded text-sm"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                        type="submit"
                        className="flex-1 bg-black text-white py-2 rounded hover:bg-black/70 transition"
                        >
                        Save
                        </button>

                        <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white py-2 rounded hover:bg-gray-200 transition"
                        >
                        Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
