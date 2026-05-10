-- Insert new categories: Forecasters, Ephemera (Landing + Navigation)
INSERT INTO "Category" ("id", "name", "description", "label", "order", "location", "createdAt", "updatedAt")
VALUES
  (
    'c9a2b5d7-3e48-4f12-a9b1-8c7d6e5f4a3b',
    'forecasters',
    'Instruments designed to interpret current atmospheric conditions and translate them into short-term weather predictions. These devices range from scientifically grounded systems based on barometric pressure and cloud observation to more intuitive or empirical forecasting tools, reflecting both the practical needs and popular understanding of weather in different periods.',
    'Forecasters',
    8,
    ARRAY['Landing', 'Navigation']::"CategoryLocation"[],
    NOW(),
    NOW()
  ),
  (
    'd8b3c6e9-4f59-4a23-b0c2-9d8e7f6a5b4c',
    'ephemera',
    'A collection of historical printed materials associated with weather instruments, including advertisements, manuals, receipts, catalogues, and other documentary traces. These items provide valuable context on the production, distribution, and everyday use of meteorological devices, preserving the commercial and cultural environment in which they existed.',
    'Ephemera',
    9,
    ARRAY['Landing', 'Navigation']::"CategoryLocation"[],
    NOW(),
    NOW()
  )
ON CONFLICT ("name") DO NOTHING;

-- Promote Friends category to both Landing and Navigation
UPDATE "Category"
SET
  "location" = ARRAY['Landing', 'Navigation']::"CategoryLocation"[],
  "updatedAt" = NOW()
WHERE "name" = 'friends';
