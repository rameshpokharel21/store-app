import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const EMPTY_FORM = {
    name: "", categoryId: "", barcode: "", unit: "pcs",
    reorderLevel: 10, avgCostPrice: "", sellingPrice: "",
};

const Modal = ({ title, form, setForm, categories, onSave, onClose, isPending, error }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">{title}</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">— None —</option>
                        {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                    <input type="text" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                    <input type="number" min="0" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: Number(e.target.value) }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avg Cost Price</label>
                    <input type="number" min="0" step="0.01" value={form.avgCostPrice} onChange={e => setForm(f => ({ ...f, avgCostPrice: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                    <input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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

const ProductsPage = () => {
    const { hasAnyRole } = useAuth();
    const [filters, setFilters] = useState({});
    const [categoryFilter, setCategoryFilter] = useState("");
    const [barcodeFilter, setBarcodeFilter] = useState("");

    const { data: products, isLoading, isError } = useProducts(filters);
    const { data: categories } = useCategories();
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteError, setDeleteError] = useState(null);

    const canEdit = hasAnyRole(["MANAGER", "ADMIN"]);
    const canDelete = hasAnyRole(["ADMIN"]);

    const applyFilters = () => {
        const f = {};
        if (categoryFilter) f.categoryId = categoryFilter;
        if (barcodeFilter.trim()) f.barcode = barcodeFilter.trim();
        setFilters(f);
    };

    const clearFilters = () => {
        setCategoryFilter(""); setBarcodeFilter(""); setFilters({});
    };

    const openCreate = () => { setForm(EMPTY_FORM); setShowCreate(true); };
    const openEdit = (p) => {
        setForm({
            name: p.name, categoryId: p.categoryId || "",
            barcode: p.barcode || "", unit: p.unit || "pcs",
            reorderLevel: p.reorderLevel ?? 10,
            avgCostPrice: p.avgCostPrice ?? "",
            sellingPrice: p.sellingPrice ?? "",
        });
        setEditTarget(p);
    };

    const buildPayload = (f) => ({
        name: f.name, categoryId: f.categoryId || null,
        barcode: f.barcode || null, unit: f.unit,
        reorderLevel: f.reorderLevel,
        avgCostPrice: f.avgCostPrice !== "" ? Number(f.avgCostPrice) : null,
        sellingPrice: f.sellingPrice !== "" ? Number(f.sellingPrice) : null,
    });

    const handleCreate = async () => {
        await createMutation.mutateAsync(buildPayload(form));
        setShowCreate(false);
    };

    const handleUpdate = async () => {
        await updateMutation.mutateAsync({ id: editTarget.id, data: buildPayload(form) });
        setEditTarget(null);
    };

    const handleDelete = async (p) => {
        setDeleteError(null);
        try {
            await deleteMutation.mutateAsync(p.id);
        } catch (e) {
            setDeleteError(e?.response?.data?.message || "Cannot delete product.");
        }
    };

    const categoryName = (id) => categories?.find(c => c.id === id)?.name || "—";

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    {canEdit && (
                        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                            + New Product
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Category</label>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="">All</option>
                            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Barcode</label>
                        <input type="text" value={barcodeFilter} onChange={e => setBarcodeFilter(e.target.value)}
                            placeholder="Search barcode..."
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">Filter</button>
                    <button onClick={clearFilters} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition">Clear</button>
                </div>

                {deleteError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{deleteError}</div>
                )}

                {isLoading ? (
                    <LoadingSpinner message="Loading products..." />
                ) : isError ? (
                    <p className="text-red-600">Failed to load products.</p>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Barcode</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unit</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">In Stock</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reorder At</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sell Price</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Avg Cost</th>
                                    {canEdit && <th className="px-4 py-3" />}
                                </tr>
                            </thead>
                            <tbody>
                                {products?.length === 0 ? (
                                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No products found.</td></tr>
                                ) : products?.map(p => {
                                    const lowStock = p.currentQuantity <= p.reorderLevel;
                                    return (
                                        <tr key={p.id} className={`border-b border-gray-50 transition ${lowStock ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-gray-50"}`}>
                                            <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{categoryName(p.categoryId)}</td>
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.barcode || "—"}</td>
                                            <td className="px-4 py-3 text-gray-600">{p.unit}</td>
                                            <td className={`px-4 py-3 text-right font-semibold ${lowStock ? "text-amber-600" : "text-gray-800"}`}>
                                                {p.currentQuantity}
                                                {lowStock && <span className="ml-1 text-xs">⚠</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">{p.reorderLevel}</td>
                                            <td className="px-4 py-3 text-right text-gray-800">{p.sellingPrice != null ? `$${Number(p.sellingPrice).toFixed(2)}` : "—"}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">{p.avgCostPrice != null ? `$${Number(p.avgCostPrice).toFixed(2)}` : "—"}</td>
                                            {canEdit && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => openEdit(p)} className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">Edit</button>
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => handleDelete(p)}
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showCreate && (
                <Modal title="New Product" form={form} setForm={setForm} categories={categories}
                    onSave={handleCreate} onClose={() => setShowCreate(false)}
                    isPending={createMutation.isPending} error={createMutation.error} />
            )}
            {editTarget && (
                <Modal title="Edit Product" form={form} setForm={setForm} categories={categories}
                    onSave={handleUpdate} onClose={() => setEditTarget(null)}
                    isPending={updateMutation.isPending} error={updateMutation.error} />
            )}
        </div>
    );
};

export default ProductsPage;
