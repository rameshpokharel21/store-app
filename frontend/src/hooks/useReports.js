import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

export const useLowStock = () =>
    useQuery({
        queryKey: ["reports", "low-stock"],
        queryFn: api.getLowStock,
        staleTime: 5 * 60 * 1000,
    });

export const useSalesSummary = (start, end) =>
    useQuery({
        queryKey: ["reports", "sales-summary", start, end],
        queryFn: () => api.getSalesSummary(start, end),
        enabled: !!start && !!end,
        staleTime: 5 * 60 * 1000,
    });

export const useShrinkage = () =>
    useQuery({
        queryKey: ["reports", "shrinkage"],
        queryFn: api.getShrinkageReport,
        staleTime: 5 * 60 * 1000,
    });
