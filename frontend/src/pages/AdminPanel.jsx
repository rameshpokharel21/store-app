import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { AdminProvider, useAdminContext } from "../contexts/AdminContext";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useDeleteUser } from "../hooks/useDeleteUser";
import { useUpdateUserRoles } from "../hooks/useUpdateUserRoles";
import { useToggleUserEnabled } from "../hooks/useToggleUserEnabled";
import { useCreateUser } from "../hooks/useCreateUser";
import { useAuth } from "../hooks/useAuth";

const ALL_ROLES = ["STAFF", "MANAGER", "ADMIN"];

const roleBadgeClass = (role) => {
    switch (role) {
        case "ADMIN":   return "bg-purple-100 text-purple-800";
        case "MANAGER": return "bg-blue-100 text-blue-800";
        default:        return "bg-gray-100 text-gray-700";
    }
};

// ── Modals ────────────────────────────────────────────────────────────────────

function CreateUserModal() {
    const { isCreateModalOpen, closeCreateModal } = useAdminContext();
    const createUser = useCreateUser();
    const [form, setForm] = useState({ name: "", email: "", password: "", roles: ["STAFF"] });
    const [error, setError] = useState("");

    if (!isCreateModalOpen) return null;

    const toggleRole = (role) => {
        setForm((prev) => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter((r) => r !== role)
                : [...prev.roles, role],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required.");
            return;
        }
        if (form.roles.length === 0) {
            setError("Select at least one role.");
            return;
        }
        try {
            await createUser.mutateAsync(form);
            setForm({ name: "", email: "", password: "", roles: ["STAFF"] });
            closeCreateModal();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to create user.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Create New User</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Min 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                        <div className="flex gap-3">
                            {ALL_ROLES.map((role) => (
                                <label key={role} className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={form.roles.includes(role)}
                                        onChange={() => toggleRole(role)}
                                        className="accent-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">{role}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createUser.isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {createUser.isPending ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditRolesModal() {
    const { isEditRolesModalOpen, selectedUser, closeEditRolesModal } = useAdminContext();
    const updateRoles = useUpdateUserRoles();
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEditRolesModalOpen && selectedUser) {
            setSelectedRoles([...selectedUser.roles]);
            setError("");
        }
    }, [isEditRolesModalOpen, selectedUser]);

    if (!isEditRolesModalOpen || !selectedUser) return null;

    const toggleRole = (role) => {
        setSelectedRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
    };

    const handleSave = async () => {
        setError("");
        if (selectedRoles.length === 0) {
            setError("Select at least one role.");
            return;
        }
        try {
            await updateRoles.mutateAsync({ id: selectedUser.id, roles: selectedRoles });
            setSelectedRoles([]);
            closeEditRolesModal();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to update roles.");
        }
    };

    const handleClose = () => {
        closeEditRolesModal();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Edit Roles</h2>
                <p className="text-sm text-gray-500 mb-5">{selectedUser.name} — {selectedUser.email}</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    {ALL_ROLES.map((role) => (
                        <label key={role} className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={selectedRoles.includes(role)}
                                onChange={() => toggleRole(role)}
                                className="w-4 h-4 accent-blue-600"
                            />
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(role)}`}>
                                {role}
                            </span>
                        </label>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateRoles.isPending}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {updateRoles.isPending ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteConfirmModal() {
    const { isDeleteConfirmOpen, selectedUser, closeDeleteConfirm } = useAdminContext();
    const deleteUser = useDeleteUser();
    const [error, setError] = useState("");

    if (!isDeleteConfirmOpen || !selectedUser) return null;

    const handleDelete = async () => {
        setError("");
        try {
            await deleteUser.mutateAsync(selectedUser.id);
            closeDeleteConfirm();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to delete user.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Delete User</h2>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </div>
                </div>

                <p className="text-sm text-gray-700 mb-2">
                    Are you sure you want to delete <strong>{selectedUser.name}</strong>?
                </p>
                <p className="text-xs text-gray-500 mb-5">{selectedUser.email}</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={closeDeleteConfirm}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteUser.isPending}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {deleteUser.isPending ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── User Table ────────────────────────────────────────────────────────────────

function UserRow({ user }) {
    const { openEditRolesModal, openDeleteConfirm } = useAdminContext();
    const toggleEnabled = useToggleUserEnabled();
    const { user: currentUser } = useAuth();
    const isSelf = currentUser?.id === user.id;

    const handleToggleEnabled = () => {
        toggleEnabled.mutate({ id: user.id, enabled: !user.enabled });
    };

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
            <td className="px-4 py-3 text-sm text-gray-500">{user.id}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        {isSelf && <span className="text-xs text-blue-500 font-medium">You</span>}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                    {[...user.roles].sort().map((role) => (
                        <span
                            key={role}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(role)}`}
                        >
                            {role}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.enabled ? "bg-green-500" : "bg-red-500"}`} />
                    {user.enabled ? "Active" : "Disabled"}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    {/* Edit Roles */}
                    <button
                        onClick={() => openEditRolesModal(user)}
                        title="Edit roles"
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                    </button>

                    {/* Toggle Enable/Disable */}
                    <button
                        onClick={handleToggleEnabled}
                        disabled={toggleEnabled.isPending || isSelf}
                        title={isSelf ? "Cannot disable your own account" : user.enabled ? "Disable user" : "Enable user"}
                        className={`p-1.5 rounded-lg transition disabled:opacity-40 ${
                            user.enabled
                                ? "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                                : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                        }`}
                    >
                        {user.enabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        )}
                    </button>

                    {/* Delete */}
                    <button
                        onClick={() => openDeleteConfirm(user)}
                        disabled={isSelf}
                        title={isSelf ? "Cannot delete your own account" : "Delete user"}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

function AdminPanelContent() {
    const { data: users, isLoading, isError, error } = useAdminUsers();
    const { searchTerm, setSearchTerm, openCreateModal } = useAdminContext();

    const filtered = users?.filter((u) => {
        const q = searchTerm.toLowerCase();
        return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.roles.some((r) => r.toLowerCase().includes(q))
        );
    });

    const totalUsers    = users?.length ?? 0;
    const activeUsers   = users?.filter((u) => u.enabled).length ?? 0;
    const disabledUsers = totalUsers - activeUsers;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
                    <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
                    <p className="text-purple-100 text-lg">Manage users, roles, and account status.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Users",    value: totalUsers,    color: "blue" },
                        { label: "Active Users",   value: activeUsers,   color: "green" },
                        { label: "Disabled Users", value: disabledUsers, color: "red" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <p className="text-sm text-gray-500 mb-1">{label}</p>
                            <p className={`text-3xl font-bold text-${color}-600`}>{isLoading ? "—" : value}</p>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, email or role..."
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create User
                        </button>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : isError ? (
                        <div className="text-center py-20 text-red-600 text-sm">
                            {error?.response?.data?.message || "Failed to load users."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        {["ID", "User", "Email", "Roles", "Status", "Created", "Actions"].map((h) => (
                                            <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered?.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered?.map((user) => <UserRow key={user.id} user={user} />)
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer */}
                    {!isLoading && !isError && (
                        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                            Showing {filtered?.length ?? 0} of {totalUsers} users
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            <CreateUserModal />
            <EditRolesModal />
            <DeleteConfirmModal />
        </div>
    );
}

const AdminPanel = () => (
    <AdminProvider>
        <AdminPanelContent />
    </AdminProvider>
);

export default AdminPanel;
