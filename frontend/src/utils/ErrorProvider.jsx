import { useEffect, useState } from "react"
import { onError } from "./errorHandler";
import {ErrorContext} from "./ErrorContext";


const ErrorProvider = ({children}) => {

    const [errors, setErrors] = useState([]);

    useEffect(() => {
        const unsubscribe = onError(err => {
            setErrors(prev => [...prev, err]);
        });
        return unsubscribe;
    }, []);

    const clearErrors = () => setErrors([]);


    return (
        <ErrorContext value={{errors, clearErrors}}>
            {children}
        </ErrorContext>
    )
}

export default ErrorProvider;
