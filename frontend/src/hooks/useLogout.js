import {useAuth} from "./useAuth";
import {api} from "../api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
    const {setUser} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.logout,
        onSuccess: () => {
            setUser(null);
            queryClient.clear(); //clear all cached data
        },
    });
};