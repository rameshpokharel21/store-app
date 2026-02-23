import { useMutation } from "@tanstack/react-query"
import { api } from "../api/api"

export const useRegister = () => {
    return useMutation({
        mutationFn: api.register,
    });
};