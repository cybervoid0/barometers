-- Insert Friends category (Navigation only)
INSERT INTO "Category" ("id", "name", "description", "label", "order", "location", "createdAt", "updatedAt")
VALUES (
  '015303d7-4dd3-4f58-9456-c605f34ff903',
  'friends',
  '',
  'Friends''',
  7,
  ARRAY['Navigation']::"CategoryLocation"[],
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
