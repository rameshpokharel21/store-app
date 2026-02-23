import { useMutation, useQueryClient } from "@tanstack/react-query";
import {useAuth} from "./useAuth";
import {api} from "../api/api"

export const useLogin = () => {

    const {checkAuth} = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.login,
        onSuccess: async () => {
            //after success
            await checkAuth();
            queryClient.invalidateQueries(); //refresh all cached data
        },

    });
};