import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const useAdjustments = (params = {}) =>
    useQuery({
        queryKey: ["adjustments", params],
        queryFn: () => api.getAdjustments(params),
        staleTime: 2 * 60 * 1000,
    });

export const useCreateAdjustment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createAdjustment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adjustments"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
};
