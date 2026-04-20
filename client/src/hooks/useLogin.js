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

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: {"Content-type": "application/json"},
                body: JSON.stringify({ email, password })
            })

            console.log("Login response status:", response.status);
            console.log("Login response headers:", response.headers.get('content-type'));

            // Check if response is ok BEFORE parsing JSON
            if (!response.ok) {
                const errorInfo = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
                setIsLoading(false);
                loginError = errorInfo.error || `Server error: ${response.status}`;
            } else {
                const loginInfo = await response.json();
                console.log("Login response data:", loginInfo);
                
                localStorage.setItem("user", JSON.stringify(loginInfo));

                // Update context after login successfully
                dispatch({ type: "LOGIN", payload: loginInfo });

                setIsLoading(false);
            }

            return loginError;
        } catch (err) {
            console.error("Login error:", err);
            setIsLoading(false);
            return err.message;
        }
    }

    return { login, error, isLoading }
}