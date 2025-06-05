INSERT INTO hospitals (name, address, city, lga, phone, email, specialties, ownership_type, visiting_hours, description, latitude, longitude, location, rating_avg, rating_count)
VALUES
  ('Lagos University Teaching Hospital', '1-5 Oba Akinjobi Way, Idi-Araba', 'Lagos', 'Surulere', '08012345678', 'info@luth.gov.ng',
   ARRAY['emergency','maternity','pediatric','general'], 'public',
   '**Mon–Fri:** 8am–4pm', 'LUTH is one of Nigeria''s foremost teaching hospitals.',
   6.4969, 3.3584, ST_SetSRID(ST_MakePoint(3.3584, 6.4969), 4326)::geography, 4.2, 128),
  ('Reddington Hospital', '12 Idowu Martins Street, Victoria Island', 'Lagos', 'Eti-Osa', '08098765432', 'contact@reddingtonhospital.com',
   ARRAY['maternity','dental','cardiology','general'], 'private',
   '**Daily:** 24 hours', 'Premium private hospital with state-of-the-art facilities.',
   6.4281, 3.4219, ST_SetSRID(ST_MakePoint(3.4219, 6.4281), 4326)::geography, 4.7, 89),
  ('National Hospital Abuja', 'Herbert Macaulay Way, CBD', 'Abuja', 'Abuja Municipal', '08011223344', 'info@nationalhospital.gov.ng',
   ARRAY['emergency','orthopedic','ophthalmology','general'], 'public',
   '**Mon–Sun:** 24 hours', 'Federal tertiary hospital serving the FCT.',
   9.0579, 7.4951, ST_SetSRID(ST_MakePoint(7.4951, 9.0579), 4326)::geography, 3.9, 56);
