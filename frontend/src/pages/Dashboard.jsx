import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const StatCard = ({ title, value, icon, color, alert }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 border ${alert ? "border-amber-300" : "border-gray-100"}`}>
        <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${alert ? "text-amber-600" : "text-gray-500"}`}>{title}</span>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                {icon}
            </div>
        </div>
        <p className={`text-3xl font-bold ${alert ? "text-amber-600" : "text-gray-800"}`}>{value}</p>
        {alert && (
            <p className="text-xs text-amber-600 mt-1 font-medium">Requires attention</p>
        )}
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();

    const { data: dashboardData, isLoading, isError, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: api.getDashboard,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="text-blue-100 text-lg">
                        Here&apos;s what&apos;s happening in your store today.
                    </p>
                </div>

                {isLoading ? (
                    <LoadingSpinner message="Loading dashboard..." />
                ) : isError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                        <p className="text-red-700 text-sm">
                            Failed to load dashboard: {error?.response?.data?.message || "An error occurred."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                        <StatCard
                            title="Total Users"
                            value={dashboardData?.totalUsers ?? 0}
                            color="bg-blue-100"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-blue-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Total Products"
                            value={dashboardData?.totalProducts ?? 0}
                            color="bg-indigo-100"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-indigo-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Low Stock Alert"
                            value={dashboardData?.lowStockCount ?? 0}
                            color={(dashboardData?.lowStockCount ?? 0) > 0 ? "bg-amber-100" : "bg-green-100"}
                            alert={(dashboardData?.lowStockCount ?? 0) > 0}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`size-5 ${(dashboardData?.lowStockCount ?? 0) > 0 ? "text-amber-600" : "text-green-600"}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Pending Orders"
                            value={dashboardData?.pendingOrders ?? 0}
                            color="bg-yellow-100"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-yellow-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Pending Tasks"
                            value={dashboardData?.pendingTasks ?? 0}
                            color="bg-purple-100"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-purple-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                </svg>
                            }
                        />
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h2>
                    <div className="flex flex-wrap gap-10">
                        <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Roles</p>
                            <div className="flex gap-2 mt-1">
                                {user?.roles?.map((role) => (
                                    <span
                                        key={role}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
