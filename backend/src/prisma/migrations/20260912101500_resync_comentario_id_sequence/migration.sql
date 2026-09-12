-- Reposiciona a sequência após dados legados que podem ter sido inseridos
-- com IDs explícitos antes de a coluna usar autoincremento.
SELECT setval(
  pg_get_serial_sequence('"Comentario"', 'id'),
  COALESCE((SELECT MAX("id") FROM "Comentario"), 1),
  true
);
