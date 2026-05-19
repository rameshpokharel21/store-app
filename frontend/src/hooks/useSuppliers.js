import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useSuppliers = () =>
    useQuery({
        queryKey: ["suppliers"],
        queryFn: api.getSuppliers,
        staleTime: 5 * 60 * 1000,
    });

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createSupplier,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
    });
};

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.updateSupplier(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
    });
};

export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteSupplier,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
    });
};
