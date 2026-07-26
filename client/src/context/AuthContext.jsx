import { createContext, useReducer, useEffect } from "react";
import API_BASE_URL from "../config.js";

// The context 
export const AuthContext = createContext();

// A reducer is a function that takes the current State and the Action, performs the logic, and returns a new State
export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload };
        case 'LOGOUT':
            return { user: null};
        default:
            return state
    }
}

// This is a custom wrapper
// children are the components that will be wrapped by this component => children can be the App component
// dispatch delivers the action to the reducer and that action can be an object => dispatch({ type: 'LOGIN', payload: user })
export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    }); // The initial condition is null user since there hasnt been anyone logged in

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    dispatch({ type: "LOGOUT" });
                    return;
                }

                const user = await response.json();

                dispatch({
                    type: "LOGIN",
                    payload: user,
                });
            } catch (error) {
                dispatch({ type: "LOGOUT" });
            }
        };

        checkAuth();
    }, []);

    // This will run everytime the state changes
    console.log("AuthContext state: ", state);

    // The value prop is the actual data you want to share with the rest of your application
    // VALUE IS ALSO CONTEXT
    // In JSX, when you want to write JavaScript inside your HTML-like tags, you must wrap it in curly braces
    return (
        // In React, whenever you put a component inside the opening and closing tags of another component, 
        // React automatically takes everything in the middle and bundles it into a prop called children
        <AuthContext.Provider value={{...state, dispatch}}> 
            { children }
        </AuthContext.Provider>
    )
}