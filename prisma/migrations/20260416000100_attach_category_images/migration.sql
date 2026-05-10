-- Create Image records for Forecasters, Ephemera, Friends
-- Actual image files are pre-uploaded to MinIO at the corresponding paths.
-- blurData will be generated lazily by scripts/seed-category-blur.ts.
INSERT INTO "Image" ("id", "url", "name", "createdAt", "updatedAt")
VALUES
  ('e0f1a2b3-c4d5-4e6f-a7b8-c9d0e1f2a3b4', 'categories/forecasters.png', 'Forecasters', NOW(), NOW()),
  ('f1e2d3c4-b5a6-4978-8b9c-0d1e2f3a4b5c', 'categories/ephemera.png',    'Ephemera',    NOW(), NOW()),
  ('a2b3c4d5-e6f7-4890-9abc-def012345678', 'categories/friends.png',     'Friends',     NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Attach images to their categories via the M2M pivot table
INSERT INTO "_CategoryImages" ("A", "B")
VALUES
  ('c9a2b5d7-3e48-4f12-a9b1-8c7d6e5f4a3b', 'e0f1a2b3-c4d5-4e6f-a7b8-c9d0e1f2a3b4'),
  ('d8b3c6e9-4f59-4a23-b0c2-9d8e7f6a5b4c', 'f1e2d3c4-b5a6-4978-8b9c-0d1e2f3a4b5c'),
  ('015303d7-4dd3-4f58-9456-c605f34ff903', 'a2b3c4d5-e6f7-4890-9abc-def012345678')
ON CONFLICT ("A", "B") DO NOTHING;
