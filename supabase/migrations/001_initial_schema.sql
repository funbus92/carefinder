-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- User roles table (admin invite-only)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Hospitals table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lga TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('public', 'private')),
  visiting_hours TEXT DEFAULT '',
  description TEXT DEFAULT '',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  rating_avg NUMERIC(3,1) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX hospitals_location_idx ON hospitals USING GIST (location);
CREATE INDEX hospitals_city_idx ON hospitals (city);
CREATE INDEX hospitals_specialties_idx ON hospitals USING GIN (specialties);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'hidden')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, user_id)
);

CREATE INDEX reviews_hospital_idx ON reviews (hospital_id);
CREATE INDEX reviews_status_idx ON reviews (status);

-- Auto-set location from lat/lng on insert/update
CREATE OR REPLACE FUNCTION set_hospital_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hospitals_set_location
  BEFORE INSERT OR UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION set_hospital_location();

-- Recalculate hospital rating when review status changes
CREATE OR REPLACE FUNCTION update_hospital_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hospitals SET
    rating_avg = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    ), 0),
    rating_count = COALESCE((
      SELECT COUNT(*)
      FROM reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    ), 0)
  WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_hospital_rating();

-- PostGIS radius search function
CREATE OR REPLACE FUNCTION hospitals_within_radius(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  city TEXT,
  lga TEXT,
  phone TEXT,
  email TEXT,
  specialties TEXT[],
  ownership_type TEXT,
  visiting_hours TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_urls TEXT[],
  rating_avg NUMERIC,
  rating_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id, h.name, h.address, h.city, h.lga, h.phone, h.email,
    h.specialties, h.ownership_type, h.visiting_hours, h.description,
    h.latitude, h.longitude, h.image_urls, h.rating_avg, h.rating_count,
    h.created_at, h.updated_at,
    ST_Distance(
      h.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000 AS distance_km
  FROM hospitals h
  WHERE ST_DWithin(
    h.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_km * 1000
  )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS policies
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Hospitals: public read, admin write
CREATE POLICY "Hospitals are publicly readable"
  ON hospitals FOR SELECT USING (true);

CREATE POLICY "Admins can insert hospitals"
  ON hospitals FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update hospitals"
  ON hospitals FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete hospitals"
  ON hospitals FOR DELETE USING (is_admin());

-- Reviews: approved reviews publicly readable
CREATE POLICY "Approved reviews are publicly readable"
  ON reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR is_admin());

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- User roles: users can read own role, admins can manage
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE USING (is_admin());

-- Storage bucket for hospital images
INSERT INTO storage.buckets (id, name, public) VALUES ('hospital-images', 'hospital-images', true);

CREATE POLICY "Public can view hospital images"
  ON storage.objects FOR SELECT USING (bucket_id = 'hospital-images');

CREATE POLICY "Admins can upload hospital images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hospital-images' AND is_admin());

CREATE POLICY "Admins can delete hospital images"
  ON storage.objects FOR DELETE USING (bucket_id = 'hospital-images' AND is_admin());
