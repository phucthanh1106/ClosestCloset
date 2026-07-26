import { useAuthContext } from "./useAuthContext"
import API_BASE_URL from "../config.js";

export const useLogout = () => {
    const { dispatch } = useAuthContext();

    const logout = async () => {
        await fetch(`${API_BASE_URL}/api/users/logout`, {
            method: "POST",
            credentials: "include",
        });

        // dispatch logout action
        dispatch({ type: "LOGOUT" });
    }

    return { logout };
}
