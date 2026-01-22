import { createContext, useContext } from "react";

export const DispatchContext = createContext();

export const useDispatchContext = () => useContext(DispatchContext);