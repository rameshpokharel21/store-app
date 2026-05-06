import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
};
