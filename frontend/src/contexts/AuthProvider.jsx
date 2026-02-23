import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react"
import {api} from "../api/api";
import {onError} from "../utils/errorHandler";
import {AuthContext} from "./AuthContext";


const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    //const [hasRefreshToken, setHasRefreshToken] = useState(false);
    
    const queryClient = useQueryClient();

    const {refetch: checkAuth} = useQuery({
        queryKey: ["auth-user"],
        queryFn: async () => {
            const data = await api.getCurrentUser();
            setUser(data.user);
            return data;
        },

        enabled: false,
        retry: false,
        staleTime: Infinity,
    });

    //check auth on mount
    /*
    React Query's refetch function(also remove, invalidateQueries etc) are intentionally stable.
    Doesn't change between renders, its' identity is memoized internally
    */
    useEffect(() => {
        const init = async () => {
            try{
                await checkAuth();
            }catch(err){
                //do not logout
            }finally{
                setIsInitialized(true);
            }
        };

        init();
    }, []);

    //listen for 401
    useEffect(() => {
        //subscribe to errors-return cleanup function
        const unsubscribe = onError(error => {
            if(error.status == 401){
                //this only runs after refresh fails
                setUser(null);
                queryClient.clear();
            }
        });
        //cleanup on unmount
        return unsubscribe;
    }, [queryClient]);


    const hasRole = role => {
        if(!user || !user.roles) return false;
        return user.roles.includes(role);
    }

    const hasAnyRole = roles => {
        if(!user || !user.roles) return false;
        return roles.some(role => user.roles.includes(role));
    }

    const value = {
        user,
        setUser,
        isAuthenticated: !!user,
        isInitialized,
        checkAuth,
        hasRole,
        hasAnyRole,
    };

    return (
        <AuthContext value={value}>
            {children}
        </AuthContext>
    )
}

export default AuthProvider
