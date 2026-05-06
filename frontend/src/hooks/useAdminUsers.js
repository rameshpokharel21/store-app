import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

export const useAdminUsers = () => {
    return useQuery({
        queryKey: ["admin", "users"],
        queryFn: api.getAllUsers,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
    });
};
