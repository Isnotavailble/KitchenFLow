-- Table: USERS
CREATE TABLE USERS (
  id INTEGER PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  mobile_num VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(60) NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN USERS.password IS 'hashed';
COMMENT ON COLUMN USERS.role IS 'ROLE_CASHIER, ROLE_CHEF, ROLE_OWNER';

-- Table: TOKENS
CREATE TABLE TOKENS (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  token_hash VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tokens_user
    FOREIGN KEY (user_id)
    REFERENCES USERS(id)
    ON DELETE CASCADE
);

-- Table: CATEGORY
CREATE TABLE CATEGORY (
  category_id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Table: MENU
CREATE TABLE MENU (
  menu_id INTEGER PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT,
  image_id TEXT,
  category_id INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  workload_tier INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_menu_category
    FOREIGN KEY (category_id)
    REFERENCES CATEGORY(category_id)
    ON DELETE SET NULL
);

COMMENT ON COLUMN MENU.workload_tier IS 'light [point = 1], medium [point = 2], heavy [point = 3]';
COMMENT ON COLUMN MENU.updated_at IS 'For sync process';

-- Table: ORDERS
CREATE TABLE ORDERS (
  order_id INTEGER PRIMARY KEY,
  order_number INTEGER NOT NULL,
  user_id INTEGER,
  status VARCHAR(60) NOT NULL,
  order_tier INTEGER DEFAULT NULL,
  payment_status VARCHAR(60) DEFAULT 'paid',
  payment_method VARCHAR(60) DEFAULT 'cash',
  subtotal_price INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id)
    REFERENCES USERS(id)
    ON DELETE SET NULL
);

COMMENT ON COLUMN ORDERS.order_number IS 'KF-001, KF-002 (count by day)';
COMMENT ON COLUMN ORDERS.user_id IS 'Cashier who created it';
COMMENT ON COLUMN ORDERS.status IS 'waiting, completed, cancelled';
COMMENT ON COLUMN ORDERS.order_tier IS 'Order level workload tier: light (0-3) < medium (4-6) < heavy (7+) ranking snapshot';
COMMENT ON COLUMN ORDERS.payment_status IS 'unpaid, paid';
COMMENT ON COLUMN ORDERS.payment_method IS 'cash, online';
COMMENT ON COLUMN ORDERS.subtotal_price IS 'Price before tax/discounts';
COMMENT ON COLUMN ORDERS.tax_amount IS 'Added for Owner Tax Reports';
COMMENT ON COLUMN ORDERS.total_price IS 'price after tax/discounts';
COMMENT ON COLUMN ORDERS.updated_at IS 'For sync process';

-- Table: ORDER_ITEMS
CREATE TABLE ORDER_ITEMS (
  order_item_id INTEGER PRIMARY KEY,
  order_id INTEGER,
  menu_id INTEGER,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  item_notes VARCHAR(255),
  CONSTRAINT fk_orderitems_order
    FOREIGN KEY (order_id)
    REFERENCES ORDERS(order_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_orderitems_menu
    FOREIGN KEY (menu_id)
    REFERENCES MENU(menu_id)
    ON DELETE SET NULL
);

COMMENT ON COLUMN ORDER_ITEMS.unit_price IS 'Price snapshot at purchase';
