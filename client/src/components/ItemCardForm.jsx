import { useState } from "react";
import { useForm} from "react-hook-form";

export default function ItemCardForm({ item, onClose, onSave }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            description: item.description || "",
            brand: item.brand || "",
            link: item.link || "",
            notes: item.notes || ""
        }
    });



    // handleSubmit handles the form; onSubmit handles your app logic
    // data is an object whose keys are the names you passed to register, and whose values are the current input values
    const onSubmit = (data) => {
        const updatedItem = {
            ...item,
            ...data,
            hasInfo: true
        };
        onSave(updatedItem);
        onClose();
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

                {/* Link */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                    Link
                    </label>
                    <input
                    type="url"
                    {...register("link", {
                        pattern: {
                        value: /^https?:\/\/.+/i,
                        message: "Must be a valid URL"
                        }
                    })}
                    className="w-full p-2 border rounded text-sm"
                    />
                    {errors.link && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors.link.message}
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
