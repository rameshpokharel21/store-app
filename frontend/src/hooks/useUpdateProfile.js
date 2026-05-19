import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth-user"] });
        },
    });
};
