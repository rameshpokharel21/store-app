import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import Navbar from "../components/Navbar";

const UserProfile = () => {
    const { user, checkAuth } = useAuth();
    const [name, setName] = useState("");
    const [editing, setEditing] = useState(false);
    const [success, setSuccess] = useState(false);
    const updateProfile = useUpdateProfile();

    const startEdit = () => {
        setName(user?.name || "");
        setEditing(true);
        setSuccess(false);
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        try {
            await updateProfile.mutateAsync({ name: name.trim() });
            await checkAuth();
            setEditing(false);
            setSuccess(true);
        } catch {
            // error shown from mutation state
        }
    };

    const handleCancel = () => {
        setEditing(false);
        updateProfile.reset();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-10">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="bg-linear-to-r from-blue-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Name</label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    autoFocus
                                />
                            ) : (
                                <p className="text-sm text-gray-800 py-2">{user?.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
                            <p className="text-sm text-gray-800 py-2">{user?.email}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Roles</label>
                            <div className="flex gap-2 flex-wrap py-2">
                                {user?.roles?.map(role => (
                                    <span key={role} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {user?.createdAt && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Member since</label>
                                <p className="text-sm text-gray-800 py-2">
                                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                                </p>
                            </div>
                        )}
                    </div>

                    {updateProfile.isError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                                {updateProfile.error?.response?.data?.message || "Failed to update profile."}
                            </p>
                        </div>
                    )}

                    {success && !editing && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">Profile updated successfully.</p>
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={updateProfile.isPending || !name.trim()}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium text-sm"
                                >
                                    {updateProfile.isPending ? "Saving..." : "Save"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={updateProfile.isPending}
                                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={startEdit}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                            >
                                Edit Name
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
