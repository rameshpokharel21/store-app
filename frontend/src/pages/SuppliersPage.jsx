import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "../hooks/useSuppliers";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const EMPTY_FORM = { name: "", contactInfo: "", address: "" };

const Modal = ({ title, form, setForm, onSave, onClose, isPending, error }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">{title}</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Supplier name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                    <input
                        type="text" value={form.contactInfo}
                        onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Phone / email"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                        type="text" value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Street, city"
                    />
                </div>
            </div>
            {error && (
                <p className="mt-3 text-sm text-red-600">{error?.response?.data?.message || "An error occurred."}</p>
            )}
            <div className="flex gap-3 mt-6 justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button
                    onClick={onSave}
                    disabled={isPending || !form.name.trim()}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {isPending ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    </div>
);

const SuppliersPage = () => {
    const { hasAnyRole } = useAuth();
    const { data: suppliers, isLoading, isError } = useSuppliers();
    const createMutation = useCreateSupplier();
    const updateMutation = useUpdateSupplier();
    const deleteMutation = useDeleteSupplier();

    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteError, setDeleteError] = useState(null);

    const canEdit = hasAnyRole(["MANAGER", "ADMIN"]);
    const canDelete = hasAnyRole(["ADMIN"]);

    const openCreate = () => { setForm(EMPTY_FORM); setShowCreate(true); };
    const openEdit = (s) => { setForm({ name: s.name, contactInfo: s.contactInfo || "", address: s.address || "" }); setEditTarget(s); };

    const handleCreate = async () => {
        await createMutation.mutateAsync(form);
        setShowCreate(false);
    };

    const handleUpdate = async () => {
        await updateMutation.mutateAsync({ id: editTarget.id, data: form });
        setEditTarget(null);
    };

    const handleDelete = async (id) => {
        setDeleteError(null);
        try {
            await deleteMutation.mutateAsync(id);
        } catch (e) {
            setDeleteError(e?.response?.data?.message || "Cannot delete supplier.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
                    {canEdit && (
                        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                            + New Supplier
                        </button>
                    )}
                </div>

                {deleteError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{deleteError}</div>
                )}

                {isLoading ? (
                    <LoadingSpinner message="Loading suppliers..." />
                ) : isError ? (
                    <p className="text-red-600">Failed to load suppliers.</p>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact Info</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Address</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                                    {canEdit && <th className="px-6 py-3" />}
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers?.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No suppliers yet.</td></tr>
                                ) : suppliers?.map(s => (
                                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 font-medium text-gray-800">{s.name}</td>
                                        <td className="px-6 py-3 text-gray-600">{s.contactInfo || "—"}</td>
                                        <td className="px-6 py-3 text-gray-600">{s.address || "—"}</td>
                                        <td className="px-6 py-3 text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                                        {canEdit && (
                                            <td className="px-6 py-3">
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => openEdit(s)} className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">Edit</button>
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(s.id)}
                                                            disabled={deleteMutation.isPending}
                                                            className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition disabled:opacity-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showCreate && (
                <Modal
                    title="New Supplier"
                    form={form} setForm={setForm}
                    onSave={handleCreate} onClose={() => setShowCreate(false)}
                    isPending={createMutation.isPending}
                    error={createMutation.error}
                />
            )}
            {editTarget && (
                <Modal
                    title="Edit Supplier"
                    form={form} setForm={setForm}
                    onSave={handleUpdate} onClose={() => setEditTarget(null)}
                    isPending={updateMutation.isPending}
                    error={updateMutation.error}
                />
            )}
        </div>
    );
};

export default SuppliersPage;
