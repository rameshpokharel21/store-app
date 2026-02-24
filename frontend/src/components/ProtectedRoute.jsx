
import { Navigate, useLocation } from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";


const ProtectedRoute = ({children}) => {

    const {isAuthenticated, isInitialized} = useAuth();
    const location = useLocation();

    //still checking auth status
    if(!isInitialized){
        return <LoadingSpinner message="Checking authentication..." />;

    }

    //not authenticated: save current location
    if(!isAuthenticated){
        return <Navigate to="/login" state = {{from: location}} replace />;
    }

    return children;
}

export default ProtectedRoute
