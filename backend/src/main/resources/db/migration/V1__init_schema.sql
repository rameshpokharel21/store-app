CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    enabled    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT      NOT NULL REFERENCES users(id),
    roles   VARCHAR(50) NOT NULL
);

CREATE TABLE categories (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP
);

CREATE TABLE suppliers (
    id           VARCHAR(36) PRIMARY KEY,
    name         VARCHAR(255) NOT NULL UNIQUE,
    contact_info VARCHAR(255),
    address      TEXT,
    created_at   TIMESTAMP
);

CREATE TABLE products (
    id               VARCHAR(36) PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    category_id      VARCHAR(36) REFERENCES categories(id),
    barcode          VARCHAR(255) UNIQUE,
    unit             VARCHAR(50)  NOT NULL,
    reorder_level    INT          NOT NULL DEFAULT 0,
    current_quantity INT          NOT NULL DEFAULT 0,
    avg_cost_price   NUMERIC(10,2),
    selling_price    NUMERIC(10,2),
    created_at       TIMESTAMP
);

CREATE TABLE purchase_orders (
    id          VARCHAR(36) PRIMARY KEY,
    supplier_id VARCHAR(36) NOT NULL REFERENCES suppliers(id),
    manager_id  BIGINT      NOT NULL REFERENCES users(id),
    status      VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMP
);

CREATE TABLE purchase_order_items (
    id                VARCHAR(36)    PRIMARY KEY,
    purchase_order_id VARCHAR(36)    NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id        VARCHAR(36)    NOT NULL REFERENCES products(id),
    ordered_quantity  INT            NOT NULL,
    received_quantity INT            NOT NULL DEFAULT 0,
    unit_price        NUMERIC(10,2)  NOT NULL
);

CREATE TABLE inventory_adjustments (
    id              VARCHAR(36) PRIMARY KEY,
    product_id      VARCHAR(36) NOT NULL REFERENCES products(id),
    user_id         BIGINT      NOT NULL REFERENCES users(id),
    change_type     VARCHAR(50) NOT NULL,
    quantity_change INT         NOT NULL,
    reason          TEXT,
    created_at      TIMESTAMP
);

CREATE TABLE tasks (
    id             VARCHAR(36) PRIMARY KEY,
    assigned_by_id BIGINT      NOT NULL REFERENCES users(id),
    assigned_to_id BIGINT      NOT NULL REFERENCES users(id),
    title          VARCHAR(255),
    description    TEXT,
    status         VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    due_date       TIMESTAMP,
    created_at     TIMESTAMP
);
