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
            const response = await fetch("https://closestcloset-backend.onrender.com/api/users/login", {
                method: 'POST',
                headers: {"Content-type": "application/json"},
                body: JSON.stringify({ email, password })
            })

            console.log("Login response status:", response.status);
            console.log("Login response headers:", response.headers.get('content-type'));

            const loginInfo = await response.json();
            console.log("Login response data:", loginInfo);

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
        } catch (err) {
            console.error("Login error:", err);
            setIsLoading(false);
            return err.message;
        }
    }

    return { login, error, isLoading }
}