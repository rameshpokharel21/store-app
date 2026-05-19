import { useState } from "react";
import { useLowStock, useSalesSummary, useShrinkage } from "../hooks/useReports";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const SectionHeader = ({ title, description }) => (
    <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
);

const LowStockSection = () => {
    const { data, isLoading, isError } = useLowStock();
    if (isLoading) return <LoadingSpinner message="Loading low stock..." />;
    if (isError) return <p className="text-red-600 text-sm">Failed to load low stock report.</p>;
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">In Stock</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reorder At</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">All products are sufficiently stocked.</td></tr>
                    ) : data?.map(p => (
                        <tr key={p.id} className="border-b border-gray-50 bg-amber-50">
                            <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                            <td className="px-4 py-3 text-right font-semibold text-amber-600">{p.currentQuantity}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{p.reorderLevel}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SalesSummarySection = () => {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [queryStart, setQueryStart] = useState("");
    const [queryEnd, setQueryEnd] = useState("");

    const { data, isLoading, isError } = useSalesSummary(submitted ? queryStart : null, submitted ? queryEnd : null);

    const handleSubmit = () => {
        if (!start || !end) return;
        setQueryStart(start);
        setQueryEnd(end);
        setSubmitted(true);
    };

    return (
        <div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input type="date" value={start} onChange={e => { setStart(e.target.value); setSubmitted(false); }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input type="date" value={end} onChange={e => { setEnd(e.target.value); setSubmitted(false); }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!start || !end}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                    Generate
                </button>
            </div>

            {submitted && (
                isLoading ? <LoadingSpinner message="Calculating..." /> :
                isError ? <p className="text-red-600 text-sm">Failed to generate sales summary.</p> :
                data ? (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                            <p className="text-xs text-gray-500 mb-1">Period</p>
                            <p className="text-sm font-semibold text-gray-800">{queryStart} → {queryEnd}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                            <p className="text-xs text-gray-500 mb-1">Units Sold</p>
                            <p className="text-3xl font-bold text-blue-600">{data.totalUnitsSold ?? 0}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-600">
                                ${Number(data.totalRevenue ?? 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                ) : null
            )}
        </div>
    );
};

const ShrinkageSection = () => {
    const { data, isLoading, isError } = useShrinkage();
    if (isLoading) return <LoadingSpinner message="Loading shrinkage..." />;
    if (isError) return <p className="text-red-600 text-sm">Failed to load shrinkage report.</p>;
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Spoiled</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Damaged</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total Loss</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No shrinkage recorded.</td></tr>
                    ) : data?.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-medium text-gray-800">{row.productName}</td>
                            <td className="px-4 py-3 text-right text-orange-600">{row.spoiledQty ?? 0}</td>
                            <td className="px-4 py-3 text-right text-red-600">{row.damagedQty ?? 0}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800">{(row.spoiledQty ?? 0) + (row.damagedQty ?? 0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TABS = [
    { key: "lowstock", label: "Low Stock" },
    { key: "sales", label: "Sales Summary" },
    { key: "shrinkage", label: "Shrinkage" },
];

const ReportsPage = () => {
    const [tab, setTab] = useState("lowstock");

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

                <div className="flex gap-1 mb-6 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-5 py-2 text-sm font-medium rounded-lg transition ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === "lowstock" && (
                    <>
                        <SectionHeader title="Low Stock" description="Products at or below their reorder level." />
                        <LowStockSection />
                    </>
                )}
                {tab === "sales" && (
                    <>
                        <SectionHeader title="Sales Summary" description="Total units sold and revenue for a date range." />
                        <SalesSummarySection />
                    </>
                )}
                {tab === "shrinkage" && (
                    <>
                        <SectionHeader title="Shrinkage" description="Spoiled and damaged inventory by product." />
                        <ShrinkageSection />
                    </>
                )}
            </main>
        </div>
    );
};

export default ReportsPage;
