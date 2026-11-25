const { Router } = require('express');
const { registrarUsuario, logarUsuario, logarAdmin, solicitarRecuperacaoSenha, redefinirSenha, obterUsuarioPorEmail, listarUsuarios, buscarUsuarioPorId, atualizarUsuario, deletarUsuario, criarLivro, listarLivros, buscarLivroPorId, atualizarLivro, deletarLivro, criarResenha, listarResenhas, listarResenhasPorLivro, buscarResenhaPorId, atualizarResenha, deletarResenha, adicionarFavorito, removerFavorito, listarFavoritosUsuario, verificarFavorito, salvarLeitura, listarLeiturasUsuario, removerLeituraUsuario, uploadFotoPerfil, curtirResenha, descurtirResenha, verificarCurtidaResenha, avaliarResenha, obterAvaliacaoResenha, criarComentario, listarComentariosResenha, deletarComentario, buscar, listarTodosComentarios, atualizarComentarioAdmin, deletarComentarioAdmin, criarDenuncia, listarDenuncias, atualizarStatusDenunciaCtrl, deletarDenunciaCtrl } = require('../controllers/controller');
const { uploadBooks, uploadPerfil } = require('../config/multer');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { rateLimit } = require('express-rate-limit');
const crypto = require('crypto');
const { criarComentarioComAvaliacao, deletarComentarioComAvaliacao } = require('../controllers/controller');

const router = Router();

const handleUploadPerfil = (req, res, next) => {
	uploadPerfil.single('fotoPerfil')(req, res, (err) => {
		if (!err) return next();

		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ error: 'Arquivo muito grande. O tamanho máximo é 10MB.' });
		}

		if (err.message) {
			return res.status(400).json({ error: err.message });
		}

		return res.status(500).json({ error: 'Erro ao processar upload da imagem' });
	});
};

router.post('/registro', registrarUsuario);
router.post('/login', logarUsuario);
router.post('/admin/login', logarAdmin);
const resetIpLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const resetEmailLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, keyGenerator: req => crypto.createHash('sha256').update(String(req.body?.email || '').trim().toLowerCase()).digest('hex') });
router.post('/auth/forgot-password', resetIpLimit, resetEmailLimit, solicitarRecuperacaoSenha);
router.post('/auth/reset-password', resetIpLimit, redefinirSenha);
router.get('/usuario/:email', requireAuth, requireAdmin, obterUsuarioPorEmail);
router.get('/me', requireAuth, (req, res) => {
  req.params.id = String(req.auth.userId);
  return buscarUsuarioPorId(req, res);
});
router.put('/me', requireAuth, (req, res) => {
  req.params.id = String(req.auth.userId);
  return atualizarUsuario(req, res);
});

// Rotas de administração de usuários
router.get('/admin/usuarios', requireAuth, requireAdmin, listarUsuarios);
router.get('/admin/usuarios/:id', requireAuth, requireAdmin, buscarUsuarioPorId);
router.put('/admin/usuarios/:id', requireAuth, requireAdmin, atualizarUsuario);
router.delete('/admin/usuarios/:id', requireAuth, requireAdmin, deletarUsuario);

// Rotas de administração de livros
router.post('/admin/livros', requireAuth, requireAdmin, uploadBooks.fields([{ name: 'fotoCapa', maxCount: 1 }, { name: 'galeria', maxCount: 10 }]), criarLivro);
router.get('/admin/livros', requireAuth, requireAdmin, listarLivros);
router.get('/admin/livros/:id', requireAuth, requireAdmin, buscarLivroPorId);
router.put('/admin/livros/:id', requireAuth, requireAdmin, uploadBooks.fields([{ name: 'fotoCapa', maxCount: 1 }, { name: 'galeria', maxCount: 10 }]), atualizarLivro);
router.delete('/admin/livros/:id', requireAuth, requireAdmin, deletarLivro);

router.get('/livros', listarLivros);
router.get('/livros/:id', buscarLivroPorId);

// Rotas de resenhas
router.post('/resenhas', requireAuth, criarResenha);
router.get('/resenhas', listarResenhas);
router.get('/resenhas/livro/:livroId', listarResenhasPorLivro);
router.get('/resenhas/:id', buscarResenhaPorId);
router.put('/resenhas/:id', requireAuth, atualizarResenha);
router.delete('/resenhas/:id', requireAuth, deletarResenha);

// Rotas admin de resenhas
router.get('/admin/resenhas', requireAuth, requireAdmin, listarResenhas);
router.put('/admin/resenhas/:id', requireAuth, requireAdmin, atualizarResenha);
router.delete('/admin/resenhas/:id', requireAuth, requireAdmin, deletarResenha);

// Rotas de favoritos
router.post('/favoritos', requireAuth, adicionarFavorito);
router.delete('/favoritos/:usuarioId/:livroId', requireAuth, removerFavorito);
router.get('/favoritos/:usuarioId', requireAuth, listarFavoritosUsuario);
router.get('/favoritos/:usuarioId/:livroId', requireAuth, verificarFavorito);

// Rotas de leituras
router.post('/leituras', requireAuth, salvarLeitura);
router.get('/leituras/:usuarioId', requireAuth, listarLeiturasUsuario);
router.delete('/leituras/:usuarioId/:livroId', requireAuth, removerLeituraUsuario);

// Rota de upload de foto de perfil
router.post('/upload/foto-perfil', requireAuth, handleUploadPerfil, uploadFotoPerfil);

// Rotas de curtidas em resenhas
router.post('/resenhas/:resenhaId/curtir', requireAuth, curtirResenha);
router.delete('/resenhas/:resenhaId/curtir', requireAuth, descurtirResenha);
router.get('/resenhas/:resenhaId/curtir/:usuarioId', requireAuth, verificarCurtidaResenha);
router.get('/resenhas/:resenhaId/avaliacoes', obterAvaliacaoResenha);

// Rotas de comentários
router.post('/comentarios', requireAuth, criarComentarioComAvaliacao);
router.get('/resenhas/:resenhaId/comentarios', listarComentariosResenha);
router.delete('/comentarios/:comentarioId', requireAuth, deletarComentarioComAvaliacao);

// Rotas admin de comentários
router.get('/admin/comentarios', requireAuth, requireAdmin, listarTodosComentarios);
router.put('/admin/comentarios/:comentarioId', requireAuth, requireAdmin, atualizarComentarioAdmin);
router.delete('/admin/comentarios/:comentarioId', requireAuth, requireAdmin, deletarComentarioAdmin);

// Rotas de denúncias de comentários
router.post('/denuncias', requireAuth, criarDenuncia);
router.get('/admin/denuncias', requireAuth, requireAdmin, listarDenuncias);
router.put('/admin/denuncias/:denunciaId', requireAuth, requireAdmin, atualizarStatusDenunciaCtrl);
router.delete('/admin/denuncias/:denunciaId', requireAuth, requireAdmin, deletarDenunciaCtrl);

// Busca
router.get('/search', buscar);

module.exports = router;
