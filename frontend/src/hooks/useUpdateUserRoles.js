import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useUpdateUserRoles = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, roles }) => api.updateUserRoles(id, roles),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
};
