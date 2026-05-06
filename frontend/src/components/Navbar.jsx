import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {useLogout} from "../hooks/useLogout";

const Navbar = () => {

    const {user, hasRole} = useAuth();
    const logoutMutation = useLogout();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logoutMutation.mutateAsync();
        navigate("/login");
    };

    //helper function to check if link is active
    const isActive = (path) => {
        return location.pathname === path;
    };


  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">

                {/* Left side-Logo and Navigation links*/}
                <div className="flex items-center gap-8">
                    {/*Logo/Brand-just text*/}
                    <div className="flex items-center gap-2">
                        <div className="bg-linear-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-lg flex itmes-center justify-center p-2">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>


                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            MyApp
                        </span>
                    </div>

                    {/*Naviation Links*/}
                    <div className="hidden md:flex gap-6">
                        <NavLink
                            to="/dashboard"
                            className={`font-medum transition ${
                                isActive("/dashboard")
                                ? "Text-blue-600 border-b-2 border-blue-600 pb-1"
                                : "text-gray-700 hover:text-blue-600"
                            }`}
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/profile"
                            className={`font-medium transition ${
                                isActive("/profile")
                                ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                                : "text-gray-700 hover:text-blue-600"
                            }`}
                        >
                            Profile
                        </NavLink>

                        {/*show Admin link only if user has ADMIN role*/}
                        {hasRole("ADMIN") && (
                            <NavLink
                                to="/admin"
                                className={`font-medium transition ${
                                    isActive("/admin")
                                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                                    : "text-gray-700 hover:text-blue-600"
                                }`}
                            >
                                Admin Panel
                            </NavLink>
                        )}

                        {/*Show Manager Link if user has ADMIN or MANAGER role */}
                        {(hasRole("ADMIN") || hasRole("MANAGER")) && (
                            <NavLink
                                to="/manager"
                                className={`font-medium transition ${
                                    isActive("/manager")
                                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                                    : "text-gray-700 hover:text-blue-600"
                                }`}
                            >
                                Manager
                            </NavLink>
                        )}
                    </div>
                </div>

                {/* right side - User info and Logout */}
                <div className="flex items-center gap-4">
                    {/*user info*/}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="bg-linear-to-r from-blue-600 to-indigo-600 w-9 h-9 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500">
                                {user?.roles?.join(", ")}
                            </p>
                        </div>
                    </div>

                    {/*Logout button */}
                    <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50 font-0medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>

                        <span className="hidden sm:inline">
                            {logoutMutation.isPending ? "Logging out..." : "Logout"}
                        </span>
                    </button>
                </div>

            </div>
        </div>
    </nav>
  )
}

export default Navbar
