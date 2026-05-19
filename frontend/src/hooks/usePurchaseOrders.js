import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api";

export const usePurchaseOrders = (params = {}) =>
    useQuery({
        queryKey: ["purchase-orders", params],
        queryFn: () => api.getPurchaseOrders(params),
        staleTime: 2 * 60 * 1000,
    });

export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createPurchaseOrder,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    });
};

export const useReceiveShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ poId, data }) => api.receiveShipment(poId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
};
