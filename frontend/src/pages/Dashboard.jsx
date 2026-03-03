import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth"
import { api } from "../api/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";


const Dashboard = () => {

    const {user} = useAuth();

    //fetch data
    const {data: dashboardData, isLoading, isError, error} = useQuery({
        queryKey: ["dashboard"],
        queryFn: api.getDashboard,
        staleTime: 2*60*1000, //2 minutes
        gcTime: 10*60*1000, //keep in cache for 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000*2 ** attemptIndex, 30000),
    });


  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx0auto px-4 sm:px-6 lg:px-8 py-8">
            {/*Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
                <h1 className="text-4xl font-bold mb-2">
                    Welcome back, {user?.name}!
                </h1>
                <p className="text-blue-100 text-lg">
                    here's what's happening with your account today.
                </p>
            </div>

            {/*stats*/}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                    <h3>Total Users: </h3>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : isError ? (
                        <p className="text-red-600 text-sm">Failed to load: {error.data?.message}</p>
                    ) : (
                        <p>{dashboardData?.totalUsers || 0}</p>
                    )}
                </div>
                <div>
                    <h3>Active Projects: </h3>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : isError ? (
                        <p className="text-red-600 text-sm">Failed to load: {error.data?.message}</p>
                    ) : (
                        <p>{dashboardData?.activeProjects || 0}</p>
                    )}
                </div>

                 <div>
                    <h3>Pending Tasks: </h3>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : isError ? (
                        <p className="text-red-600 text-sm">Failed to load</p>
                    ) : (
                        <p>{dashboardData?.pendingTasks || 0}</p>
                    )}
                </div>

            </div>

            {/*User info*/}
            <div className="text-center bg-gray-60 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Your Information
                </h2>
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
        </main>
      
    </div>
  )
}

export default Dashboard
