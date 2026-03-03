
import { Navigate, useNavigate } from "react-router-dom";
import {useAuth} from "../hooks/useAuth";



const RoleBasedRoute = ({children, allowedRoles}) => {

    const navigate = useNavigate();
    const {isAuthenticated, isInitialized, user, hasAnyRole} = useAuth();

    //still checking auth
    if(!isInitialized){
        return <LoadingSpinner message="Checking permissions..." />;
    }

    //not authenticated
    if(!isAuthenticated){
        return <Navigate to="/login" replace />;
    }

    if(!hasAnyRole(allowedRoles)){
        return(
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to access this page.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Required roles:</span>{allowedRoles.join(", ")}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Your roles:</span>{user?.roles?.join(", ")}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

  return children;
}

export default RoleBasedRoute
