import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Header } from './components/header/Header'
import { Footer } from './components/footer/Footer'
import { CardBook } from './components/cardbook/CardBook'
import Slider from './components/slider/Slider'
import Cardreview from './components/cardreview/Cardreview'
import { PgLogin } from './pages/PgLogin'
import { PgCadastro } from './pages/PgCadastro'
import PgResenha from './pages/PgResenha'
import PgBusca from './pages/PgBusca'
import PgPerfil from './pages/PgPerfil'
import PgEsqueciSenha from './pages/PgEsqueciSenha'
import PgAjuda from './pages/institucional/PgAjuda'
import PgContato from './pages/institucional/PgContato'
import PgTermos from './pages/institucional/PgTermos'
import PgPrivacidade from './pages/institucional/PgPrivacidade'
import { PgAdminLogin } from './pages/admin/PgAdminLogin'
import { PgAdminDashboard } from './pages/admin/PgAdminDashboard'
import { PgAdminUsers } from './pages/admin/PgAdminUsers'
import PgAdminBooks from './pages/admin/PgAdminBooks'
import { PgAdminResenhas } from './pages/admin/PgAdminResenhas'
import PgAdminComentarios from './pages/admin/PgAdminComentarios'
import api from './services/api'
import homeStyles from './styles/Home.module.css'

function Home() {
  const navigate = useNavigate();
  const [livros, setLivros] = useState([]);
  const [resenhas, setResenhas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarLivros();
    carregarResenhas();
  }, []);

  async function carregarLivros() {
    try {
      const response = await api.get('/admin/livros');
      // Filtrar apenas livros ativos
      const livrosAtivos = (response.data || []).filter(livro => livro.ativo !== false);
      setLivros(livrosAtivos);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarResenhas() {
    try {
      const response = await api.get('/resenhas');
      // Filtrar apenas resenhas ativas e pegar as mais recentes
      const resenhasAtivas = (response.data || [])
        .filter(resenha => resenha.ativo !== false)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3); // Pegar apenas as 3 mais recentes
      setResenhas(resenhasAtivas);
    } catch (error) {
      console.error('Erro ao carregar resenhas:', error);
    }
  }

  if (loading) {
    return (
      <main className={homeStyles.home}>
        <div className={homeStyles.emptyState}><p>Carregando livros...</p></div>
      </main>
    );
  }

  return (
    <main className={homeStyles.home}>
      <section className={homeStyles.hero}>
        <div>
          <p className={homeStyles.eyebrow}>Um lugar para cada história</p>
          <h1 className={homeStyles.heroTitle}>Encontre seu próximo livro favorito.</h1>
          <p className={homeStyles.heroText}>Explore o catálogo, descubra novas perspectivas e acompanhe a comunidade de leitores da Estante Aberta.</p>
          <div className={homeStyles.heroActions}>
            <a className={homeStyles.primaryAction} href="#catalogo">Explorar catálogo</a>
          </div>
        </div>
        <aside className={homeStyles.heroNote}>
          <span className={homeStyles.heroNoteMark}>“</span>
          <strong>Leitura compartilhada fica ainda melhor.</strong>
          <p>Salve livros para depois, registre seu progresso e participe das conversas que cada história desperta.</p>
        </aside>
      </section>

      <div className={`${homeStyles.content} ${homeStyles.quickLinks}`}>
        <a className={homeStyles.quickLink} href="#catalogo"><span>◈</span><strong>Descubra livros</strong><small>Encontre títulos por autor, categoria ou ISBN.</small></a>
        <a className={homeStyles.quickLink} href="#resenhas"><span>✦</span><strong>Veja opiniões reais</strong><small>Leia experiências de outros leitores antes de escolher.</small></a>
        <a className={homeStyles.quickLink} href="/cadastro"><span>♡</span><strong>Monte sua estante</strong><small>Crie sua conta para favoritar e acompanhar leituras.</small></a>
      </div>

      <div className={homeStyles.content}>
        <section className={homeStyles.section} id="catalogo">
          <div className={homeStyles.sectionHeader}>
            <div><h2>Livros em destaque</h2><p>Uma seleção para começar sua próxima leitura.</p></div>
            <a className={homeStyles.sectionLink} href="#catalogo">Ver catálogo</a>
          </div>
          {livros.length > 0 ? <Slider items={livros} renderItem={(livro) => <CardBook key={livro.id} id={livro.id} image={livro.fotoCapa ? `http://localhost:3001${livro.fotoCapa}` : '/placeholder.png'} title={livro.titulo} author={livro.autor} />} slidesToShow={5} gap={20} autoplay autoplayInterval={5000} infinite maxItemWidth={280} /> : <div className={homeStyles.emptyState}>Nenhum livro disponível no momento.</div>}
        </section>

        <section className={homeStyles.section} id="resenhas">
          <div className={homeStyles.sectionHeader}>
            <div><h2>Resenhas recentes</h2><p>Descubra o que a comunidade está lendo.</p></div>
          </div>
          {resenhas.length > 0 ? <div className={homeStyles.reviews}>{resenhas.map((resenha) => <Cardreview key={resenha.id} bookCover={resenha.livro?.fotoCapa ? `http://localhost:3001${resenha.livro.fotoCapa}` : '/placeholder.png'} userPhoto={resenha.usuario?.fotoPerfil ? `http://localhost:3001${resenha.usuario.fotoPerfil}` : null} userName={resenha.usuario?.nome || 'Usuário'} bookTitle={resenha.livro?.titulo || 'Livro'} reviewText={resenha.textoResumo || ''} reviewDate={new Date(resenha.createdAt).toLocaleDateString('pt-BR')} rating={resenha.avaliacao || 0} likes={resenha.curtidas || 0} onClick={() => navigate(`/resenha?livroId=${resenha.livroId}`)} />)}</div> : <div className={homeStyles.emptyState}>As primeiras resenhas da comunidade aparecerão aqui.</div>}
        </section>
      </div>
    </main>
  );
}

function AppLayout() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/login' || 
                          location.pathname === '/cadastro' ||
                          location.pathname === '/esqueci-senha' ||
                          location.pathname.startsWith('/admin');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PgLogin />} />
        <Route path="/cadastro" element={<PgCadastro />} />
        <Route path="/esqueci-senha" element={<PgEsqueciSenha />} />
        <Route path="/resenha" element={<PgResenha />} />
        <Route path="/busca" element={<PgBusca />} />
        <Route path="/perfil" element={<PgPerfil />} />
        
        {/* Support Pages */}
        <Route path="/ajuda" element={<PgAjuda />} />
        <Route path="/contato" element={<PgContato />} />
        <Route path="/termos" element={<PgTermos />} />
        <Route path="/privacidade" element={<PgPrivacidade />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<PgAdminLogin />} />
        <Route path="/admin/dashboard" element={<PgAdminDashboard />} />
        <Route path="/admin/usuarios" element={<PgAdminUsers />} />
        <Route path="/admin/livros" element={<PgAdminBooks />} />
        <Route path="/admin/resenhas" element={<PgAdminResenhas />} />
        <Route path="/admin/comentarios" element={<PgAdminComentarios />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App