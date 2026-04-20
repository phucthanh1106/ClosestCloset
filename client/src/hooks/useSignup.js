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

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
                method: 'POST',
                headers: {"Content-type": "application/json"},
                body: JSON.stringify({ email, password })
            })

            // Check if response is ok BEFORE parsing JSON
            if (!response.ok) {
                const errorInfo = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
                setIsLoading(false);
                signupError = errorInfo.error || `Server error: ${response.status}`;
            } else {
                const signupInfo = await response.json();

                // save the user to local storage so that if the user comes back a few hours later
                // they will still be signed in 
                localStorage.setItem("user", JSON.stringify(signupInfo));

                // update the auth context
                dispatch({ type: 'LOGIN', payload: signupInfo });
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Signup error:", err);
            setIsLoading(false);
            signupError = err.message;
        }

        return signupError;
    }

    return { signup, isLoading }
}