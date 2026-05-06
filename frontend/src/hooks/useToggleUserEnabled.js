import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useToggleUserEnabled = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, enabled }) => api.updateUserEnabled(id, enabled),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
};
