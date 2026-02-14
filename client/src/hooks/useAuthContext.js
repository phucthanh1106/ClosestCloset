import { AuthContext } from "../context/AuthContext.jsx";
import { useContext } from "react";

// Its job is just to provide the context to the components (the context includes the user and the dispatch function)
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    

    if (!context) {
        throw Error("useAuthContext must be used inside an AuthContextProvider");
    }

    return context;
}