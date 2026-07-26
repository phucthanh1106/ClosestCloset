import { useState } from "react";
import { useAuthContext } from "./useAuthContext.js"
import API_BASE_URL from "../config.js";

export const useSignup = () => {
    // const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const { dispatch } = useAuthContext();

    const signup = async (email, password) => {
        setIsLoading(true);
        // setError(null);
        let signupError = null;

        const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
            method: 'POST',
            headers: {"Content-type": "application/json"},
            credentials: "include",
            body: JSON.stringify({ email, password })
        })

        const signupInfo = await response.json();

        if (!response.ok) {
            setIsLoading(false);
            // setError(signupInfo.error);
            signupError = signupInfo.error;
        } else {
            // update the auth context
            dispatch({ type: 'LOGIN', payload: signupInfo });
            setIsLoading(false);
        }

        return signupError;
    }

    return { signup, isLoading }
}