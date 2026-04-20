import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import API_BASE_URL from "../config.js";

export const useLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const { dispatch } = useAuthContext();

    const login = async (email, password) => {
        setIsLoading(true);
        // setError(null);
        let loginError = null;

        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({ email, password })
        })

        const loginInfo = await response.json();

        if (!response.ok) {
            setIsLoading(false);
            // setError(loginInfo.error);
            loginError = loginInfo.error;
        } else {
            localStorage.setItem("user", JSON.stringify(loginInfo));

            // Update context after login successfully
            dispatch({ type: "LOGIN", payload: loginInfo });
            
            setIsLoading(false);
        }

        return loginError;
    }

    return { login, error, isLoading }
}