import { useReducer, useEffect } from "react"
import { DispatchContext } from "../contexts/DispatchContext";
import { StateContext } from "../contexts/StateContext";
import { reducer, initialState } from "../reducers/mainReducer";

const StoreContextProvider = ({
    children
}) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        try {
          localStorage.setItem('explorer', JSON.stringify(state.explorer));
        } catch (e) {
          console.error('Failed to save explorer to localStorage', e);
        }
    }, [state.explorer]);

    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}

export default StoreContextProvider;