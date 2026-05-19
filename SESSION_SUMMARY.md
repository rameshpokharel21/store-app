# Session Summary — Inventory System Build

**Date:** 2026-05-19  
**Stack:** Java 26 · Spring Boot 4.0.2 · PostgreSQL 16.13 · Maven

---

## 1. Design Review

Reviewed the overall inventory system design built on top of existing JWT auth. Full assessment:

### What was solid
- JWT access + refresh tokens in HttpOnly cookies — production-quality auth
- RBAC (STAFF / MANAGER / ADMIN) maps naturally to a store
- `InventoryAdjustment` as an audit trail for every stock change
- Partial receipt support on `PurchaseOrder` (PENDING → PARTIALLY_RECEIVED → RECEIVED)
- DTO pattern applied consistently — entities never exposed directly
- Global exception handler covering validation, auth, and 500s

### Flaws identified and fixed in this session

| # | Issue | Status |
|---|-------|--------|
| 1 | No `SupplierController` — suppliers couldn't be managed via API | ✅ Fixed |
| 2 | `PurchaseOrderItem` had no `unitPrice` — cost tracking impossible | ✅ Fixed |
| 3 | `avgCostPrice` was static, never updated on receipt | ✅ Fixed |
| 4 | `ReportService` used `avgCostPrice` as revenue proxy (cost ≠ revenue) | ✅ Fixed |
| 5 | No validation: `receivedQuantity` could exceed `orderedQuantity` | ✅ Fixed |
| 6 | Business services lived in `security/service/` package | Fixed by user |
| 7 | Dashboard returned hardcoded mock data | ✅ Fixed |
| 8 | No Flyway despite being in architecture decisions | ✅ Fixed |

Remaining items (not addressed this session):
- Mixed ID types: `User` uses `Long`, all other entities use `String` UUID
- `findByCurrentQuantityLessThanEqual(int)` broken query still in `ProductRepository` (use `findLowStockProducts()` instead)

---

## 2. Changes Made

### 2.1 Supplier Module (new)

**Problem:** `Supplier` entity, repository, and DTOs existed but there was no controller or service. Purchase orders require a `supplierId` so the database had to be seeded manually — the system was unusable without this.

**Files created/modified:**
- `service/SupplierService.java` — CRUD with name uniqueness check; blocks delete if supplier has existing purchase orders
- `controller/SupplierController.java` — REST at `/api/suppliers`
- `repository/PurchaseOrderRepository.java` — added `existsBySupplierId(String)`
- `dto/request/SupplierRequest.java` — fixed field mismatch (`description` → `contactInfo` + `address`)

**Endpoints:**

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/suppliers` | STAFF, MANAGER, ADMIN |
| GET | `/api/suppliers/{id}` | STAFF, MANAGER, ADMIN |
| POST | `/api/suppliers` | MANAGER, ADMIN |
| PUT | `/api/suppliers/{id}` | MANAGER, ADMIN |
| DELETE | `/api/suppliers/{id}` | ADMIN only |

---

### 2.2 Unit Price + Cost Tracking

**Problem:** `PurchaseOrderItem` had no price. `avgCostPrice` on `Product` was set once at creation and never updated. `ReportService.getSalesSummary` multiplied `avgCostPrice × units_sold` and called it "revenue" — this is cost, not revenue.

**Files modified:**

**`entity/PurchaseOrderItem.java`**
- Added `unitPrice` (BigDecimal, non-null) — price per unit agreed at order time

**`entity/Product.java`**
- Added `sellingPrice` (BigDecimal) — price charged to customers
- `avgCostPrice` now has a meaningful comment: weighted average of purchase unit prices

**`dto/request/PurchaseOrderItemRequest.java`**
- Added `unitPrice` with `@NotNull @DecimalMin("0.01")` validation

**`dto/response/PurchaseOrderItemRequest.java`**
- Added `unitPrice` and computed `lineTotal` (unitPrice × orderedQuantity)
- Fixed typo: `productid` → `productId`

**`dto/request/ProductRequest.java`**
- Added `sellingPrice`

**`dto/response/ProductResponse.java`**
- Added `sellingPrice`
- Fixed typo: `avCostPrice` → `avgCostPrice`

**`service/PurchaseOrderService.java`**
- Sets `unitPrice` from request when creating order items
- Passes `unitPrice` to `InventoryService.receiveProductViaPurchaseOrder`

**`service/InventoryService.java`**  
`receiveProductViaPurchaseOrder` now accepts `unitPrice` and recalculates `avgCostPrice` using the weighted average formula:

```
newAvgCost = (currentQty × currentAvg + receivedQty × unitPrice)
             ─────────────────────────────────────────────────────
                         (currentQty + receivedQty)
```

**`service/ReportService.java`**
- Revenue calculation now uses `sellingPrice`; falls back to `avgCostPrice` only if `sellingPrice` is null
- This is semantically correct: `sellingPrice × units_sold = revenue`, not cost

---

### 2.3 Received Quantity Guard

**Problem:** `PurchaseOrderService.receiveShipment` accumulated received quantities without checking they didn't exceed ordered quantities. A warehouse worker could over-receive (e.g., receive 200 units on a 50-unit order) and the system would silently accept it.

**Fix in `service/PurchaseOrderService.java`:**
```java
int newTotalReceived = item.getReceivedQuantity() + receivedQuantity;
if (newTotalReceived > item.getOrderedQuantity()) {
    throw new IllegalArgumentException(
        "Received quantity (" + newTotalReceived + ") exceeds ordered quantity (" +
        item.getOrderedQuantity() + ") for product: " + item.getProduct().getName());
}
```
The guard uses the accumulated total (existing + incoming), catching over-receipt across multiple partial shipments.

---

### 2.4 Flyway Setup

**Why Flyway:** `ddl-auto: update` is dangerous in production — schema drift is silent, there is no rollback, and no audit history. Flyway was already listed as an architecture decision but was missing.

**Files created:**
- `src/main/resources/db/migration/V1__init_schema.sql` — creates all tables
- `src/main/resources/db/seed/V2__seed_dev_data.sql` — 3 categories, 2 suppliers, 6 products (dev only)
- `src/main/resources/application-dev.yml` — dev profile includes seed location
- `src/main/java/com/ramesh/backend/config/FlywayConfig.java` — manual Flyway bean

**application.yml changes (manual):**
- `ddl-auto: none` — Flyway owns DDL; Hibernate just uses the schema
- `spring.flyway.enabled: false` — disables auto-configuration (manual bean handles migration)

#### Flyway Dependency Issues Encountered

**Issue 1 — FlywayAutoConfiguration not triggering (Spring Boot 4.x)**

After adding `flyway-core` to `pom.xml` and setting `spring.flyway.enabled: true`, the app showed zero Flyway log output — not even the Flyway banner. Spring Boot 4.0.2 is very new and its `FlywayAutoConfiguration` was not being triggered by the standard auto-configuration mechanism.

**Fix:** Created `FlywayConfig.java` as a manual `@Bean` with `initMethod = "migrate"`:
```java
@Bean(initMethod = "migrate")
public Flyway flyway(DataSource dataSource,
                     @Value("${spring.flyway.locations:classpath:db/migration}") String[] locations) {
    return Flyway.configure()
            .dataSource(dataSource)
            .locations(locations)
            .load();
}
```
This bypasses Spring Boot's auto-configuration entirely and guarantees Flyway runs during context initialisation.

**Issue 2 — `Unsupported Database: PostgreSQL 16.13`**

After the manual bean was working, the next error was:
```
org.flywaydb.core.api.FlywayException: Unsupported Database: PostgreSQL 16.13
  at flyway-core-11.14.1.jar
```

**Root cause:** Spring Boot 4.0.2 manages **Flyway 11.x**. Starting from Flyway 10, the PostgreSQL database driver was extracted from `flyway-core` into a separate module. `flyway-core` alone can connect to the database but does not know how to handle any specific database type — it throws "Unsupported Database" for everything.

**Fix:** Add the PostgreSQL-specific module alongside `flyway-core`:
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

This pattern applies to all databases in Flyway 10+: MySQL needs `flyway-database-mysql`, Oracle needs `flyway-database-oracle`, etc. No version numbers are needed since Spring Boot's BOM manages the Flyway version.

**How Flyway works (reference):**

1. Migration files live in `src/main/resources/db/migration/` named `V{n}__{description}.sql`
2. On startup, Flyway checks `flyway_schema_history` table in the database
3. Any migration not yet applied is run in version order
4. Applied migrations are checksummed and locked — modifying a past migration causes a startup failure
5. Schema changes always require a new file (e.g., `V3__add_column_foo.sql`)

**Profile-based seed data:**
- Default profile: `classpath:db/migration` only (schema)
- Dev profile (`application-dev.yml`): `classpath:db/migration,classpath:db/seed` (schema + seed data)
- Bootstrap users (admin/manager/staff) are handled by `BootstrapUserInitializer.java` — not duplicated in seed SQL

---

### 2.5 Dashboard — Real Data

**Problem:** `DashboardController` returned hardcoded `{ totalUsers: 150, activeProjects: 23, pendingTasks: 47 }`. `activeProjects` doesn't exist as a concept in this system.

**Files created/modified:**
- `dto/response/DashboardResponse.java` — replaced `activeProjects` with inventory-relevant fields
- `service/DashboardService.java` — new service with real queries
- `controller/DashboardController.java` — injected `DashboardService`
- `repository/TaskRepository.java` — added `countByStatus(TaskStatus)`
- `repository/ProductRepository.java` — added `countLowStockProducts()` JPQL count query
- `repository/PurchaseOrderRepository.java` — added `countByStatusIn(List<PurchaseOrderStatus>)`

**Response shape:**
```json
{
  "totalUsers": 3,
  "totalProducts": 6,
  "lowStockCount": 0,
  "pendingOrders": 0,
  "pendingTasks": 2
}
```

Each field is a single `COUNT` query — fast regardless of data volume.

---

## 3. File Tree of New/Changed Files

```
backend/
├── pom.xml                                              ← flyway-core + flyway-database-postgresql
├── src/main/resources/
│   ├── application-dev.yml                             ← NEW: dev profile flyway locations
│   └── db/
│       ├── migration/
│       │   └── V1__init_schema.sql                     ← NEW: all tables
│       └── seed/
│           └── V2__seed_dev_data.sql                   ← NEW: dev seed data
└── src/main/java/com/ramesh/backend/
    ├── config/
    │   └── FlywayConfig.java                           ← NEW: manual Flyway bean
    ├── controller/
    │   ├── DashboardController.java                    ← updated: real data
    │   └── SupplierController.java                     ← NEW
    ├── dto/
    │   ├── request/
    │   │   ├── ProductRequest.java                     ← +sellingPrice
    │   │   ├── PurchaseOrderItemRequest.java           ← +unitPrice
    │   │   └── SupplierRequest.java                    ← fixed fields
    │   └── response/
    │       ├── DashboardResponse.java                  ← inventory metrics
    │       ├── ProductResponse.java                    ← +sellingPrice, fixed typo
    │       └── PurchaseOrderItemResponse.java          ← +unitPrice, +lineTotal, fixed typo
    ├── entity/
    │   ├── Product.java                                ← +sellingPrice
    │   └── PurchaseOrderItem.java                      ← +unitPrice
    ├── repository/
    │   ├── ProductRepository.java                      ← +countLowStockProducts()
    │   ├── PurchaseOrderRepository.java                ← +existsBySupplierId(), +countByStatusIn()
    │   └── TaskRepository.java                         ← +countByStatus()
    └── service/
        ├── DashboardService.java                       ← NEW
        ├── InventoryService.java                       ← weighted avg cost on receipt
        ├── ProductService.java                         ← sellingPrice in create/update
        ├── PurchaseOrderService.java                   ← unitPrice, over-receipt guard
        ├── ReportService.java                          ← sellingPrice for revenue
        └── SupplierService.java                        ← NEW
```
