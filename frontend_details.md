# Frontend Details — Bug Fixes, New Features, and Patterns

**Stack:** React 19 · Vite 7 · Tailwind CSS 4 · TanStack React Query v5 · React Router v7 · Axios

---

## 1. Bug Fixes

### 1.1 `LoadingSpinner.jsx` — Parameter Typo
**File:** `src/components/LoadingSpinner.jsx`

**Bug:** The destructured prop was named `messsage` (three s's) instead of `message`. Any caller passing `message="..."` would receive `undefined` and the component would always render the hardcoded default `"Loading..."`.

**Fix:** Renamed `messsage` → `message`.

---

### 1.2 `RoleBasedRoute.jsx` — Missing Import
**File:** `src/components/RoleBasedRoute.jsx`

**Bug:** The component rendered `<LoadingSpinner message="Checking permissions..." />` while auth was initializing, but `LoadingSpinner` was never imported. This caused a runtime `ReferenceError` the moment any role-protected route was visited before auth completed.

**Fix:** Added `import LoadingSpinner from "./LoadingSpinner"`.

---

### 1.3 `Navbar.jsx` — Three Tailwind Class Typos
**File:** `src/components/Navbar.jsx`

**Bugs:** Three invalid Tailwind classes that silently produced no styling:
- `font-0medium` → `font-medium` (stray `0` character)
- `itmes-center` → `items-center` (transposition typo)
- `Text-blue-600` → `text-blue-600` (uppercase `T` — Tailwind is case-sensitive)

**Fix:** Corrected all three class names.

**Also fixed:** The nav link active/inactive logic was using a manual `isActive()` helper function. Replaced with React Router v7's built-in `NavLink` render prop `({ isActive }) => ...`, which is the idiomatic approach and updates correctly on navigation.

---

### 1.4 `Dashboard.jsx` — Wrong Error Path + Stale Field
**File:** `src/pages/Dashboard.jsx`

**Bug 1:** The error message access was `error.data?.message`. Axios wraps the response body under `error.response`, so the correct path is `error.response?.data?.message`. The original code always displayed nothing when an API error occurred.

**Bug 2:** The dashboard referenced `dashboardData?.activeProjects` — a field that no longer exists in the backend response. The backend was updated to return `{ totalUsers, totalProducts, lowStockCount, pendingOrders, pendingTasks }` and the frontend was not updated to match.

**Fix:** Corrected the error path. Replaced three old stat cards with five new ones matching the actual backend response shape.

---

### 1.5 `Login.jsx` — Full-Screen Spinner Inside Submit Button
**File:** `src/pages/Login.jsx`

**Bug:** The submit button rendered `<LoadingSpinner />` as its loading state. `LoadingSpinner` renders a `min-h-screen` full-page overlay — placing it inside a `<button>` caused the entire screen to be replaced by a spinner on submit, which is both visually broken and semantically invalid (a full-screen div inside a button).

**Fix:** Removed the `LoadingSpinner` import from Login entirely. Added a local `<Spinner />` component — a small inline SVG (the standard animated arc pattern) that sits correctly inside the button alongside the "Processing..." label.

**Also fixed in the same file:**
- SVG attributes used HTML attribute names instead of JSX names: `stroke-width` → `strokeWidth`, `stroke-linecap` → `strokeLinecap`, `class` → `className`. React ignores unknown props so these had no effect.
- Typo in validation message: `"Passswords do not match."` → `"Passwords do not match."`
- Added `await checkAuth()` after the register flow so the UI reflects the newly logged-in user immediately without requiring a page refresh.

---

## 2. New Features

### 2.1 API Layer — `src/api/api.js`
Added 17 new methods to the `api` object. All methods follow the same pattern: call `axiosInstance`, return `response.data`.

| Group | Methods |
|-------|---------|
| Profile | `updateProfile(data)` → `PUT /api/user/profile` |
| Categories | `getCategories()`, `createCategory(data)`, `deleteCategory(id)` |
| Products | `getProducts(params)`, `createProduct(data)`, `updateProduct(id, data)`, `deleteProduct(id)` |
| Suppliers | `getSuppliers()`, `createSupplier(data)`, `updateSupplier(id, data)`, `deleteSupplier(id)` |
| Purchase Orders | `getPurchaseOrders(params)`, `createPurchaseOrder(data)`, `receiveShipment(poId, data)` |
| Inventory | `getAdjustments(params)`, `createAdjustment(data)` |
| Reports | `getLowStock()`, `getSalesSummary(start, end)`, `getShrinkageReport()` |

`getProducts` and `getPurchaseOrders` accept a `params` object that Axios serializes as query string parameters (e.g. `?categoryId=x&barcode=y`), keeping the API layer thin with no URL string building in the caller.

---

### 2.2 Hooks Layer — 7 New Hook Files

All hooks follow the conventions already established in the codebase:
- Read operations: `useQuery` with a descriptive `queryKey`
- Write operations: `useMutation` with `onSuccess` calling `queryClient.invalidateQueries` to keep UI in sync

**`useUpdateProfile.js`**
Single mutation. On success, invalidates `["auth-user"]` so the navbar name updates without a refresh.

**`useCategories.js`**
- `useCategories()` — query, `staleTime: 5min` (categories rarely change)
- `useCreateCategory()` — mutation, invalidates `["categories"]`
- `useDeleteCategory()` — mutation, invalidates `["categories"]`

**`useProducts.js`**
- `useProducts(filters)` — query with `queryKey: ["products", filters]`. Passing different filter objects produces separate cache entries, so switching between `?categoryId=A` and `?categoryId=B` does not cause a flash of stale data.
- `useCreateProduct()`, `useUpdateProduct()`, `useDeleteProduct()` — mutations. `useUpdateProduct` and `useDeleteProduct` take `{ id, data }` / `id` destructured in the `mutationFn`.

**`useSuppliers.js`**
Same pattern as categories: one query hook + create/update/delete mutations.

**`usePurchaseOrders.js`**
- `usePurchaseOrders(params)` — parameterized query
- `useCreatePurchaseOrder()` — invalidates `["purchase-orders"]`
- `useReceiveShipment()` — invalidates `["purchase-orders"]`, `["products"]`, and `["dashboard"]` because receiving a shipment changes product stock and dashboard low-stock count simultaneously

**`useInventory.js`**
- `useAdjustments(params)` — accepts `{ productId, type }` filters; also used by the Sales tab with `{ type: "SOLD" }` hardcoded at the page level
- `useCreateAdjustment()` — invalidates adjustments, products, and dashboard for the same reason as receive shipment

**`useReports.js`**
Three read-only queries:
- `useLowStock()` — always enabled
- `useSalesSummary(start, end)` — `enabled: !!start && !!end` so the query only fires after the user submits a date range, not on page load
- `useShrinkage()` — always enabled

---

### 2.3 Dashboard — 5 Real Stat Cards
**File:** `src/pages/Dashboard.jsx`

Replaced the three unstyled div blocks with a `<StatCard>` component that accepts `title`, `value`, `icon`, `color`, and `alert` props.

Five cards:
1. **Total Users** — blue
2. **Total Products** — indigo
3. **Low Stock Alert** — amber when `lowStockCount > 0`, green when 0. When amber, the card border changes to `border-amber-300`, the value turns amber, and an "Requires attention" sub-label appears. This gives a visual warning without requiring the user to navigate to the Reports page first.
4. **Pending Orders** — yellow
5. **Pending Tasks** — purple

---

### 2.4 User Profile — `src/pages/UserProfile.jsx`
Displays the authenticated user's name, email, roles (as rounded badges), and `createdAt` (formatted with `toLocaleDateString`).

Name editing:
- Clicking "Edit Name" switches the name field from display text to a controlled `<input>`.
- Save calls `PUT /api/user/profile`, then calls `checkAuth()` from `AuthProvider` to re-fetch the user object — the navbar avatar initial and name update instantly without a reload.
- Cancel resets the input and clears any mutation error via `updateProfile.reset()`.
- Inline success / error feedback below the form fields, no toast library needed.

---

### 2.5 Manager Hub — `src/pages/ManagerPage.jsx`
A navigation page — no data fetching. Renders a grid of five cards (Products, Suppliers, Purchase Orders, Inventory, Reports), each with an icon, title, description, and "Go →" button. Clicking either the card or the button navigates via `useNavigate`. The entire card is clickable via `onClick` on the outer div with `e.stopPropagation()` on the inner button to avoid double-fire.

---

### 2.6 Suppliers Page — `src/pages/SuppliersPage.jsx`
Table of all suppliers with columns: Name, Contact Info, Address, Created date.

Role gating:
- STAFF: read-only view
- MANAGER/ADMIN: sees "+ New Supplier" and "Edit" buttons
- ADMIN only: sees "Delete" button

Create/Edit uses a shared `<Modal>` component rendered conditionally — create uses `showCreate` state, edit uses `editTarget` state (set to the supplier object). The modal receives `form`, `setForm`, `onSave`, `onClose`, `isPending`, and `error` as props. The same modal component handles both flows, keeping code DRY.

Delete errors (e.g. backend blocks delete if supplier has purchase orders) are caught and displayed inline above the table.

---

### 2.7 Products Page — `src/pages/ProductsPage.jsx`
Table with columns: Name, Category (resolved from category list), Barcode, Unit, In Stock, Reorder At, Sell Price, Avg Cost.

**Low stock highlighting:** Rows where `currentQuantity <= reorderLevel` receive an amber background (`bg-amber-50`) and the stock count is displayed in amber with a ⚠ symbol.

**Filters:** Category dropdown and barcode text input. Filters are only applied when the user clicks "Filter" — this avoids firing a new query on every keystroke. The filter state is kept separate from the active query params so the inputs feel responsive.

**Modals:** Same shared pattern as Suppliers. Create and Edit use one `<Modal>` component with a 2-column grid layout for the fields. `buildPayload()` normalizes the form state before sending — converts empty strings to `null` for optional price fields, converts strings to numbers for numeric fields.

---

### 2.8 Purchase Orders Page — `src/pages/PurchaseOrdersPage.jsx`
The most complex page. Two modals:

**Create Order Modal — 3-step wizard:**
- Step 1: Select supplier from dropdown
- Step 2: Add line items. Each row has product selector, quantity input, unit price input. "+ Add line" appends a new empty row. The × button removes a row (hidden when only one row remains). List is scrollable if many items are added.
- Step 3: Confirmation review — shows supplier name and a summary table with product name, qty, unit $, and line total (qty × unit price). Place Order submits; Back returns to step 2.

A visual step indicator (numbered circles connected by a line) shows current progress. Circles fill in blue as steps complete.

The "Next" and "Review" buttons are disabled until required fields are filled, preventing empty submissions early.

**Receive Shipment Modal:**
Appears when clicking "Receive" on a PENDING or PARTIALLY_RECEIVED row. Shows only the items that are not yet fully received (`receivedQuantity < orderedQuantity`). Each item shows the product name, remaining quantity, and a number input. Only items with quantity > 0 are included in the payload.

**Status filter:** Dropdown (ALL / PENDING / PARTIALLY_RECEIVED / RECEIVED / CANCELLED). When ALL is selected, no `status` param is sent to the API.

**Status badges:** Color-coded — yellow (PENDING), blue (PARTIALLY_RECEIVED), green (RECEIVED), gray (CANCELLED).

---

### 2.9 Inventory Page — `src/pages/InventoryPage.jsx`
Two tabs: **Adjustments** and **Sales**.

The tabs share the same `useAdjustments` hook. The Sales tab hardcodes `params.type = "SOLD"` and hides the type filter. The Adjustments tab exposes both a product filter and a type filter dropdown.

**Type badges:** Color-coded — green (RECEIVED), blue (SOLD), orange (SPOILED), red (DAMAGED), gray (MANUAL_ADJUST).

**Quantity change column:** Positive changes display with a `+` prefix in green, negative changes in red.

**Create Adjustment Modal:** Dropdown for product, dropdown for adjustment type, number input for quantity change (positive or negative), and an optional reason text field. Modal state is self-contained — `useState` lives inside the modal component so the parent page does not need to manage form fields.

---

### 2.10 Reports Page — `src/pages/ReportsPage.jsx`
Three tabs:

**Low Stock** — Table of products at or below reorder level. Uses `useLowStock()` which fires on page load. Rows are amber-highlighted. Shows "All products are sufficiently stocked." when the list is empty.

**Sales Summary** — Two date inputs (start, end). The query uses `enabled: !!start && !!end` so nothing fires until the user clicks Generate. After submitting, results show in three cards: period, units sold, and total revenue formatted as currency. Changing a date field sets `submitted` back to false, preventing stale results from showing.

**Shrinkage** — Table with spoiled count, damaged count, and total loss per product. No filters — shows all time.

---

### 2.11 Routing — `src/App.jsx`
Five new routes added:

| Path | Component | Guard |
|------|-----------|-------|
| `/products` | `ProductsPage` | `ProtectedRoute` (any auth) |
| `/inventory` | `InventoryPage` | `ProtectedRoute` |
| `/suppliers` | `SuppliersPage` | `RoleBasedRoute` MANAGER/ADMIN |
| `/purchase-orders` | `PurchaseOrdersPage` | `RoleBasedRoute` MANAGER/ADMIN |
| `/reports` | `ReportsPage` | `RoleBasedRoute` MANAGER/ADMIN |

Products and Inventory are accessible to all authenticated users (including STAFF). Suppliers, Orders, and Reports require at least MANAGER. The role check at the route level is the source of truth — the UI hiding buttons is just UX sugar on top.

---

### 2.12 Navbar — `src/components/Navbar.jsx`
Added three links visible to MANAGER/ADMIN (alongside the existing Manager link): **Suppliers**, **Orders**, **Reports**. All use NavLink's `isActive` render prop for the active indicator styling.

---

## 3. Patterns and Libraries Used

### TanStack React Query v5 (data fetching and cache)

**`useQuery`** manages server state for reads:
```js
const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", filters],   // cache key — same key = same cached response
    queryFn: () => api.getProducts(filters),
    staleTime: 2 * 60 * 1000,         // how long data is considered fresh (no refetch)
    gcTime: 10 * 60 * 1000,           // how long unused data stays in cache
});
```
`queryKey` is an array. Including `filters` in the key means different filter combinations get their own cache entries. React Query refetches when the key changes, not on every render.

**`useMutation`** manages writes:
```js
const mutation = useMutation({
    mutationFn: api.createSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
});
await mutation.mutateAsync(data); // throws on error, so try/catch works
```
`invalidateQueries` marks matching cache entries as stale. React Query refetches them on the next render that has an active subscriber (e.g. the table still mounted). This is how the table updates after a create/edit/delete without a page reload.

**`enabled` flag for conditional queries:**
```js
useQuery({
    queryKey: ["reports", "sales-summary", start, end],
    queryFn: () => api.getSalesSummary(start, end),
    enabled: !!start && !!end,   // query only fires when both dates are set
});
```
Used in `useSalesSummary` so the API call does not fire on mount before the user has chosen dates.

---

### Axios with Interceptors (`src/api/axiosInstance.js`)
The existing `axiosInstance` already handles:
- `withCredentials: true` — sends HttpOnly JWT cookies with every request
- **401 auto-refresh:** On a 401 response, the interceptor calls `POST /api/auth/refresh` and retries the original request (up to 2 attempts). If refresh fails, it fires a global error notification and rejects, which `AuthProvider` catches to clear the user state and prompt re-login.
- **Global error bus:** `notifyError` publishes errors to a small event emitter (`errorHandler.js`) that `AuthProvider` subscribes to via `onError`. This decouples Axios from React without needing a global store.

No changes were made to `axiosInstance.js` — the new API methods just use it transparently.

---

### Controlled Forms with Local State
All modals use React controlled inputs: `value={form.field}` + `onChange={e => setForm(f => ({ ...f, field: e.target.value }))}`. The functional updater `f => ({ ...f, ... })` ensures the previous state is always used as the base, avoiding stale closure bugs when multiple fields update in quick succession.

---

### Role-Based UI Rendering
The `useAuth` hook returns `hasRole(role)` and `hasAnyRole(roles[])` from `AuthProvider`. Pages use `hasAnyRole` to conditionally render action buttons:
```js
const canEdit = hasAnyRole(["MANAGER", "ADMIN"]);
const canDelete = hasAnyRole(["ADMIN"]);
// ...
{canEdit && <button>Edit</button>}
{canDelete && <button>Delete</button>}
```
This is UI-only — the backend enforces the same rules via `@PreAuthorize`. Hiding buttons is UX; the backend is the actual guard.

---

### Shared Modal Pattern
Pages with create/edit modals define a single `<Modal>` component in the same file. The parent manages two pieces of state: `showCreate` (boolean) and `editTarget` (object or null). The modal receives `onSave`, `onClose`, `isPending`, and `error` as props so it does not need to know which mutation is running. This avoids duplicating two separate modal components for what is functionally the same form.

---

### NavLink Active Styling
React Router v7's `NavLink` provides an `isActive` boolean via its `className` render prop:
```js
const navLinkClass = (isActive) =>
    `font-medium transition ${isActive ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "text-gray-700 hover:text-blue-600"}`;

<NavLink to="/products" className={({ isActive }) => navLinkClass(isActive)}>
    Products
</NavLink>
```
This correctly highlights the current page link and removes the highlight when navigating away, without manual location tracking.

---

## 4. File Summary

### Modified Files
| File | What Changed |
|------|-------------|
| `src/components/LoadingSpinner.jsx` | Fixed `messsage` typo |
| `src/components/RoleBasedRoute.jsx` | Added missing `LoadingSpinner` import |
| `src/components/Navbar.jsx` | Fixed 3 Tailwind typos; added Suppliers/Orders/Reports/Manager/Admin links; switched to NavLink `isActive` prop |
| `src/pages/Dashboard.jsx` | Fixed error path; replaced old stat cards with 5 new real-data cards; added amber low-stock alert |
| `src/pages/Login.jsx` | Replaced full-screen spinner with inline SVG spinner; fixed SVG JSX attributes; fixed password typo; added `checkAuth()` after register |
| `src/api/api.js` | Added 17 new API methods |
| `src/App.jsx` | Added 5 new routes |

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useUpdateProfile.js` | Profile update mutation |
| `src/hooks/useCategories.js` | Category CRUD hooks |
| `src/hooks/useProducts.js` | Product CRUD hooks |
| `src/hooks/useSuppliers.js` | Supplier CRUD hooks |
| `src/hooks/usePurchaseOrders.js` | Purchase order hooks + receive shipment |
| `src/hooks/useInventory.js` | Inventory adjustment hooks |
| `src/hooks/useReports.js` | Report query hooks |
| `src/pages/UserProfile.jsx` | Profile view with editable name |
| `src/pages/ManagerPage.jsx` | Navigation hub for manager features |
| `src/pages/ProductsPage.jsx` | Product table with CRUD and filters |
| `src/pages/SuppliersPage.jsx` | Supplier table with CRUD |
| `src/pages/PurchaseOrdersPage.jsx` | Purchase orders with 3-step create modal and receive shipment |
| `src/pages/InventoryPage.jsx` | Adjustments/Sales tabs with create adjustment |
| `src/pages/ReportsPage.jsx` | Low stock, sales summary, shrinkage reports |
