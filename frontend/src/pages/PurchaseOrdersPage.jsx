import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePurchaseOrders, useCreatePurchaseOrder, useReceiveShipment } from "../hooks/usePurchaseOrders";
import { useSuppliers } from "../hooks/useSuppliers";
import { useProducts } from "../hooks/useProducts";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUSES = ["ALL", "PENDING", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"];

const statusBadge = (status) => {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-700",
        PARTIALLY_RECEIVED: "bg-blue-100 text-blue-700",
        RECEIVED: "bg-green-100 text-green-700",
        CANCELLED: "bg-gray-100 text-gray-500",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
            {status?.replace("_", " ")}
        </span>
    );
};

const EMPTY_LINE = { productId: "", orderedQuantity: 1, unitPrice: "" };

const CreateOrderModal = ({ suppliers, products, onSave, onClose, isPending, error }) => {
    const [step, setStep] = useState(1);
    const [supplierId, setSupplierId] = useState("");
    const [lines, setLines] = useState([{ ...EMPTY_LINE }]);

    const addLine = () => setLines(l => [...l, { ...EMPTY_LINE }]);
    const removeLine = (i) => setLines(l => l.filter((_, idx) => idx !== i));
    const updateLine = (i, field, value) =>
        setLines(l => l.map((line, idx) => idx === i ? { ...line, [field]: value } : line));

    const canProceed = supplierId && lines.every(l => l.productId && l.orderedQuantity > 0 && l.unitPrice !== "");

    const handleSubmit = () => {
        onSave({
            supplierId,
            items: lines.map(l => ({
                productId: l.productId,
                orderedQuantity: Number(l.orderedQuantity),
                unitPrice: Number(l.unitPrice),
            })),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-4">
                <div className="flex items-center gap-3 mb-6">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`flex items-center gap-2 ${s < 3 ? "flex-1" : ""}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>{s}</div>
                            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Supplier</h2>
                        <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
                            <option value="">— Choose supplier —</option>
                            {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                            <button onClick={() => setStep(2)} disabled={!supplierId} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">Next</button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Line Items</h2>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {lines.map((line, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5">
                                        <select value={line.productId} onChange={e => updateLine(i, "productId", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                            <option value="">Product…</option>
                                            {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-3">
                                        <input type="number" min="1" value={line.orderedQuantity}
                                            onChange={e => updateLine(i, "orderedQuantity", e.target.value)}
                                            placeholder="Qty"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="number" min="0.01" step="0.01" value={line.unitPrice}
                                            onChange={e => updateLine(i, "unitPrice", e.target.value)}
                                            placeholder="Unit $"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        {lines.length > 1 && (
                                            <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addLine} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add line</button>
                        <div className="flex gap-3 mt-6 justify-end">
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Back</button>
                            <button onClick={() => setStep(3)} disabled={!lines.every(l => l.productId && l.orderedQuantity > 0 && l.unitPrice !== "")}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">Review</button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Order</h2>
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-sm text-gray-600 mb-3"><span className="font-medium">Supplier:</span> {suppliers?.find(s => s.id === supplierId)?.name}</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-500 border-b border-gray-200">
                                        <th className="text-left pb-2">Product</th>
                                        <th className="text-right pb-2">Qty</th>
                                        <th className="text-right pb-2">Unit $</th>
                                        <th className="text-right pb-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((l, i) => (
                                        <tr key={i} className="border-b border-gray-100">
                                            <td className="py-2">{products?.find(p => p.id === l.productId)?.name}</td>
                                            <td className="py-2 text-right">{l.orderedQuantity}</td>
                                            <td className="py-2 text-right">${Number(l.unitPrice).toFixed(2)}</td>
                                            <td className="py-2 text-right font-medium">${(l.orderedQuantity * l.unitPrice).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {error && <p className="mb-3 text-sm text-red-600">{error?.response?.data?.message || "An error occurred."}</p>}
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Back</button>
                            <button onClick={handleSubmit} disabled={isPending || !canProceed}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                                {isPending ? "Placing..." : "Place Order"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const ReceiveModal = ({ order, products, onSave, onClose, isPending, error }) => {
    const pendingItems = order.items?.filter(i => i.receivedQuantity < i.orderedQuantity) || [];
    const [quantities, setQuantities] = useState(
        Object.fromEntries(pendingItems.map(i => [i.productId, 0]))
    );

    const handleSubmit = () => {
        const receivedItems = Object.entries(quantities)
            .filter(([, qty]) => qty > 0)
            .map(([productId, receivedQuantity]) => ({ productId, receivedQuantity: Number(receivedQuantity) }));
        if (receivedItems.length === 0) return;
        onSave({ receivedItems });
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-5">Receive Shipment</h2>
                <div className="space-y-3">
                    {pendingItems.map(item => {
                        const remaining = item.orderedQuantity - (item.receivedQuantity || 0);
                        const pName = products?.find(p => p.id === item.productId)?.name || item.productId;
                        return (
                            <div key={item.productId} className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{pName}</p>
                                    <p className="text-xs text-gray-400">Remaining: {remaining}</p>
                                </div>
                                <input
                                    type="number" min="0" max={remaining}
                                    value={quantities[item.productId]}
                                    onChange={e => setQuantities(q => ({ ...q, [item.productId]: e.target.value }))}
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-right"
                                />
                            </div>
                        );
                    })}
                </div>
                {error && <p className="mt-3 text-sm text-red-600">{error?.response?.data?.message || "An error occurred."}</p>}
                <div className="flex gap-3 mt-6 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isPending}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                        {isPending ? "Saving..." : "Confirm Receipt"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PurchaseOrdersPage = () => {
    const { hasAnyRole } = useAuth();
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showCreate, setShowCreate] = useState(false);
    const [receiveTarget, setReceiveTarget] = useState(null);

    const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
    const { data: orders, isLoading, isError } = usePurchaseOrders(params);
    const { data: suppliers } = useSuppliers();
    const { data: products } = useProducts();
    const createMutation = useCreatePurchaseOrder();
    const receiveMutation = useReceiveShipment();

    const canCreate = hasAnyRole(["MANAGER", "ADMIN"]);

    const supplierName = (id) => suppliers?.find(s => s.id === id)?.name || "—";

    const handleCreate = async (data) => {
        await createMutation.mutateAsync(data);
        setShowCreate(false);
    };

    const handleReceive = async (data) => {
        await receiveMutation.mutateAsync({ poId: receiveTarget.id, data });
        setReceiveTarget(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
                    {canCreate && (
                        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                            + New Order
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex items-center gap-3">
                    <label className="text-xs text-gray-500">Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        {STATUSES.map(s => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace("_", " ")}</option>)}
                    </select>
                </div>

                {isLoading ? (
                    <LoadingSpinner message="Loading orders..." />
                ) : isError ? (
                    <p className="text-red-600">Failed to load purchase orders.</p>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                                    {canCreate && <th className="px-4 py-3" />}
                                </tr>
                            </thead>
                            <tbody>
                                {orders?.content?.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No purchase orders found.</td></tr>
                                ) : orders?.content?.map(o => (
                                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.id?.slice(0, 8)}…</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{supplierName(o.supplierId)}</td>
                                        <td className="px-4 py-3">{statusBadge(o.status)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{o.items?.length ?? 0}</td>
                                        <td className="px-4 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                                        {canCreate && (
                                            <td className="px-4 py-3">
                                                {(o.status === "PENDING" || o.status === "PARTIALLY_RECEIVED") && (
                                                    <button
                                                        onClick={() => setReceiveTarget(o)}
                                                        className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition"
                                                    >
                                                        Receive
                                                    </button>
                                                )}
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
                <CreateOrderModal
                    suppliers={suppliers} products={products}
                    onSave={handleCreate} onClose={() => setShowCreate(false)}
                    isPending={createMutation.isPending} error={createMutation.error}
                />
            )}
            {receiveTarget && (
                <ReceiveModal
                    order={receiveTarget} products={products}
                    onSave={handleReceive} onClose={() => setReceiveTarget(null)}
                    isPending={receiveMutation.isPending} error={receiveMutation.error}
                />
            )}
        </div>
    );
};

export default PurchaseOrdersPage;
