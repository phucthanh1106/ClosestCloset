import { createContext, useReducer } from "react";

// The context 
export const AuthContext = createContext();

// A reducer is a function that takes the current State and the Action, performs the logic, and returns a new State
export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload };
        case "LOGOUT":
            return { user: null};
        default:
            return state
    }
}

// children are the components that will be wrapped by this component => children can be the App component
// dispatch delivers the action to the reducer and that action can be an object => dispatch({ type: 'LOGIN', payload: user })
export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    }); // The initial condition is null user since there hasnt been anyone logged in

    // This will run everytime the state changes
    console.log("AuthContext state: ", state);

    // The value prop is the actual data you want to share with the rest of your application.
    // In JSX, when you want to write JavaScript inside your HTML-like tags, you must wrap it in curly braces
    return (
        <AuthContext.Provider value={{...state, dispatch}}> 
            { children }
        </AuthContext.Provider>
    )
}