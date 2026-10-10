CREATE TABLE IF NOT EXISTS addis_eats_orders (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'preparing', 'delivering', 'delivered', 'cancelled')),
  name text NOT NULL,
  phone text NOT NULL,
  area text NOT NULL,
  notes text NOT NULL DEFAULT '',
  items jsonb NOT NULL,
  total integer NOT NULL CHECK (total >= 0),
  created_at timestamptz NOT NULL,
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS addis_eats_orders_owner_created_idx
  ON addis_eats_orders (owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS addis_eats_orders_created_idx
  ON addis_eats_orders (created_at DESC);

CREATE TABLE IF NOT EXISTS addis_eats_dishes (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text NOT NULL,
  category text NOT NULL CHECK (category ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  price integer NOT NULL CHECK (price >= 0),
  image text NOT NULL,
  description text NOT NULL,
  ingredients text NOT NULL,
  prep_time text NOT NULL,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS addis_eats_dishes_available_category_idx
  ON addis_eats_dishes (available, category, name);
