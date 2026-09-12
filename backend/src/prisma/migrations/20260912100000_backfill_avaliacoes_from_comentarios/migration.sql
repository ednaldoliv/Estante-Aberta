-- Comentários antigos já podiam possuir nota antes de a avaliação ser gravada
-- também na tabela canônica de estatísticas. Para cada usuário e resenha,
-- preservamos o comentário avaliado mais recente que ainda não tenha avaliação.
INSERT INTO "AvaliacaoResenha" ("usuarioId", "resenhaId", "nota", "createdAt", "updatedAt")
SELECT DISTINCT ON (c."usuarioId", c."resenhaId")
  c."usuarioId",
  c."resenhaId",
  c."nota",
  c."createdAt",
  c."updatedAt"
FROM "Comentario" AS c
WHERE c."nota" BETWEEN 1 AND 5
  AND NOT EXISTS (
    SELECT 1
    FROM "AvaliacaoResenha" AS a
    WHERE a."usuarioId" = c."usuarioId"
      AND a."resenhaId" = c."resenhaId"
  )
ORDER BY c."usuarioId", c."resenhaId", c."createdAt" DESC, c."id" DESC;
