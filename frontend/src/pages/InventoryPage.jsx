import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAdjustments, useCreateAdjustment } from "../hooks/useInventory";
import { useProducts } from "../hooks/useProducts";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const TYPES = ["RECEIVED", "SOLD", "SPOILED", "DAMAGED", "MANUAL_ADJUST"];

const typeBadge = (type) => {
    const styles = {
        RECEIVED: "bg-green-100 text-green-700",
        SOLD: "bg-blue-100 text-blue-700",
        SPOILED: "bg-orange-100 text-orange-700",
        DAMAGED: "bg-red-100 text-red-700",
        MANUAL_ADJUST: "bg-gray-100 text-gray-700",
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || "bg-gray-100 text-gray-700"}`}>{type}</span>;
};

const CreateModal = ({ products, onSave, onClose, isPending, error }) => {
    const [form, setForm] = useState({ productId: "", type: "MANUAL_ADJUST", quantityChange: 1, reason: "" });

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-5">New Adjustment</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                        <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="">Select product…</option>
                            {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Change</label>
                        <input type="number" value={form.quantityChange}
                            onChange={e => setForm(f => ({ ...f, quantityChange: Number(e.target.value) }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        <p className="text-xs text-gray-400 mt-1">Positive to add stock, negative to remove.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                            placeholder="Optional note"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
                {error && <p className="mt-3 text-sm text-red-600">{error?.response?.data?.message || "An error occurred."}</p>}
                <div className="flex gap-3 mt-6 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                    <button
                        onClick={() => onSave(form)}
                        disabled={isPending || !form.productId}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isPending ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InventoryPage = () => {
    const { hasAnyRole } = useAuth();
    const [tab, setTab] = useState("adjustments");
    const [productFilter, setProductFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const params = {};
    if (productFilter) params.productId = productFilter;
    if (typeFilter) params.type = typeFilter;
    if (tab === "sales") params.type = "SOLD";

    const { data: adjustments, isLoading, isError } = useAdjustments(params);
    const { data: products } = useProducts();
    const createMutation = useCreateAdjustment();

    const canCreate = hasAnyRole(["MANAGER", "ADMIN"]);

    const productName = (id) => products?.find(p => p.id === id)?.name || id;

    const handleCreate = async (form) => {
        await createMutation.mutateAsync({
            productId: form.productId,
            type: form.type,
            quantity: Number(form.quantityChange),
            reason: form.reason,
        });
        setShowCreate(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
                    {canCreate && tab === "adjustments" && (
                        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                            + New Adjustment
                        </button>
                    )}
                </div>

                <div className="flex gap-1 mb-5 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
                    {[["adjustments", "Adjustments"], ["sales", "Sales"]].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => { setTab(key); setTypeFilter(""); }}
                            className={`px-5 py-2 text-sm font-medium rounded-lg transition ${tab === key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {tab === "adjustments" && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Product</label>
                            <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="">All</option>
                                {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Type</label>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="">All</option>
                                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <LoadingSpinner message="Loading..." />
                ) : isError ? (
                    <p className="text-red-600">Failed to load inventory records.</p>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Qty Change</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Adjusted By</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reason</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adjustments?.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No records found.</td></tr>
                                ) : adjustments?.map(a => (
                                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-800">{productName(a.productId)}</td>
                                        <td className="px-4 py-3">{typeBadge(a.type)}</td>
                                        <td className={`px-4 py-3 text-right font-semibold ${a.quantityChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            {a.quantityChange >= 0 ? `+${a.quantityChange}` : a.quantityChange}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{a.adjustedBy || "—"}</td>
                                        <td className="px-4 py-3 text-gray-500">{a.reason || "—"}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(a.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showCreate && (
                <CreateModal
                    products={products}
                    onSave={handleCreate}
                    onClose={() => setShowCreate(false)}
                    isPending={createMutation.isPending}
                    error={createMutation.error}
                />
            )}
        </div>
    );
};

export default InventoryPage;
