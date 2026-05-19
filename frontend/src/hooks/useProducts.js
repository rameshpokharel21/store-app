import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useProducts = (filters = {}) =>
    useQuery({
        queryKey: ["products", filters],
        queryFn: () => api.getProducts(filters),
        staleTime: 2 * 60 * 1000,
    });

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.updateProduct(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    });
};
