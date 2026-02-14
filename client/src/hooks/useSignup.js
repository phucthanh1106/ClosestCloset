import { useState } from "react";
import { useAuthContext } from "./useAuthContext.js"

export const useSignup = () => {
    // const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const { dispatch } = useAuthContext();

    const signup = async (email, password) => {
        setIsLoading(true);
        // setError(null);
        let signupError = null;

        const response = await fetch("api/users/signup", {
            method: 'POST',
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({ email, password })
        })

        const signupInfo = await response.json();

        if (!response.ok) {
            setIsLoading(false);
            // setError(signupInfo.error);
            signupError = signupInfo.error;
        } else {
            // save the user to local storage so that if the user comes back a few hours later
            // they will still be signed in 
            localStorage.setItem("user", JSON.stringify(signupInfo));

            // update the auth context
            dispatch({ type: 'LOGIN', payload: signupInfo });

            setIsLoading(false);
        }

        return signupError;
    }

    return { signup, isLoading }
}