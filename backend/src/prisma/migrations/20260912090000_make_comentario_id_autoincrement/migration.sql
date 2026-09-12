CREATE SEQUENCE IF NOT EXISTS "Comentario_id_seq";

SELECT setval(
  '"Comentario_id_seq"',
  COALESCE((SELECT MAX("id") FROM "Comentario"), 1),
  true
);

ALTER TABLE "Comentario"
  ALTER COLUMN "id" SET DEFAULT nextval('"Comentario_id_seq"');

ALTER SEQUENCE "Comentario_id_seq" OWNED BY "Comentario"."id";
