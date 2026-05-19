import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";

const navLinkClass = (isActive) =>
    `font-medium transition ${isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700 hover:text-blue-600"}`;

const Navbar = () => {
    const { user, hasRole } = useAuth();
    const logoutMutation = useLogout();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutMutation.mutateAsync();
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Left — logo + nav links */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="bg-linear-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                StoreApp
                            </span>
                        </div>

                        <div className="hidden md:flex gap-6">
                            <NavLink to="/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/products" className={({ isActive }) => navLinkClass(isActive)}>
                                Products
                            </NavLink>
                            <NavLink to="/inventory" className={({ isActive }) => navLinkClass(isActive)}>
                                Inventory
                            </NavLink>
                            <NavLink to="/profile" className={({ isActive }) => navLinkClass(isActive)}>
                                Profile
                            </NavLink>
                            {(hasRole("MANAGER") || hasRole("ADMIN")) && (<>
                                <NavLink to="/suppliers" className={({ isActive }) => navLinkClass(isActive)}>
                                    Suppliers
                                </NavLink>
                                <NavLink to="/purchase-orders" className={({ isActive }) => navLinkClass(isActive)}>
                                    Orders
                                </NavLink>
                                <NavLink to="/reports" className={({ isActive }) => navLinkClass(isActive)}>
                                    Reports
                                </NavLink>
                                <NavLink to="/manager" className={({ isActive }) => navLinkClass(isActive)}>
                                    Manager
                                </NavLink>
                            </>)}
                            {hasRole("ADMIN") && (
                                <NavLink to="/admin" className={({ isActive }) => navLinkClass(isActive)}>
                                    Admin
                                </NavLink>
                            )}
                        </div>
                    </div>

                    {/* Right — user info + logout */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="bg-linear-to-r from-blue-600 to-indigo-600 w-9 h-9 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.roles?.join(", ")}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50 font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
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
    );
};

export default Navbar;
