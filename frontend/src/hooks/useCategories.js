import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useCategories = () =>
    useQuery({
        queryKey: ["categories"],
        queryFn: api.getCategories,
        staleTime: 5 * 60 * 1000,
    });

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
};
