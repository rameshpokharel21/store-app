import { useContext } from "react";
import { ErrorContext } from "./ErrorContext";


export function useErrors(){
    return useContext(ErrorContext);
}