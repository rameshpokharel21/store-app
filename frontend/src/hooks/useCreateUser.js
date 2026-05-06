import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
};
