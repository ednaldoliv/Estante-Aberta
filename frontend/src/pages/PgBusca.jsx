import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api, { assetUrl } from '../services/api'
import { CardBook } from '../components/cardbook/CardBook'
import styles from '../styles/PgBusca.module.css'

export default function PgBusca() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('recent')

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`)
        if (!mounted) return
        setResults(Array.isArray(data?.results) ? data.results : [])
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Erro ao buscar')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (q.trim()) run()
    else {
      setResults([])
      setLoading(false)
    }
    return () => { mounted = false }
  }, [q])

  const categories = useMemo(() => [...new Set(results.map((livro) => livro.categoria).filter(Boolean))].sort(), [results])
  const authors = useMemo(() => [...new Set(results.map((livro) => livro.autor).filter(Boolean))].sort(), [results])
  const filteredResults = useMemo(() => {
    const filtered = results.filter((livro) => {
      const matchesAuthor = !authorFilter || livro.autor === authorFilter
      const matchesCategory = !categoryFilter || livro.categoria === categoryFilter
      return matchesAuthor && matchesCategory
    })

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'title') return a.titulo.localeCompare(b.titulo, 'pt-BR')
      if (sortOrder === 'author') return a.autor.localeCompare(b.autor, 'pt-BR')
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [results, authorFilter, categoryFilter, sortOrder])

  function clearFilters() {
    setAuthorFilter('')
    setCategoryFilter('')
    setSortOrder('recent')
  }

  function goHome() { navigate('/') }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Explorar estante</p>
            <h1 className={styles.title}>Resultados para “{q}”</h1>
            {!loading && !error && <p className={styles.count}>{filteredResults.length} livro{filteredResults.length === 1 ? '' : 's'} encontrado{filteredResults.length === 1 ? '' : 's'}</p>}
          </div>
          <button onClick={goHome} className={styles.backButton}>Voltar ao início</button>
        </div>

        {!loading && !error && results.length > 0 && (
          <div className={styles.filters} aria-label="Filtros de busca">
            <label className={styles.filterGroup}>
              <span className={styles.filterLabel}>Refinar busca</span>
              <input className={styles.filterInput} value={q} readOnly aria-label="Termo pesquisado" />
            </label>
            <label className={styles.filterGroup}>
              <span className={styles.filterLabel}>Autor</span>
              <select className={styles.filterSelect} value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)}>
                <option value="">Todos os autores</option>
                {authors.map((author) => <option key={author} value={author}>{author}</option>)}
              </select>
            </label>
            <label className={styles.filterGroup}>
              <span className={styles.filterLabel}>Categoria</span>
              <select className={styles.filterSelect} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="">Todas as categorias</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className={styles.filterGroup}>
              <span className={styles.filterLabel}>Ordenar</span>
              <select className={styles.filterSelect} value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="recent">Mais recentes</option>
                <option value="title">Título (A-Z)</option>
                <option value="author">Autor (A-Z)</option>
              </select>
            </label>
            <button type="button" className={styles.clearButton} onClick={clearFilters}>Limpar filtros</button>
          </div>
        )}
      </div>

      {loading && <p className={styles.state}>Buscando livros...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.container}>
          <div className={styles.resultsGrid}>
            {filteredResults.length === 0 && <p className={styles.state}>Nenhum livro corresponde aos filtros selecionados.</p>}
            {filteredResults.map((livro) => (
              <CardBook
                key={livro.id}
                id={livro.id}
                image={livro.fotoCapa ? assetUrl(livro.fotoCapa) : '/placeholder.png'}
                title={livro.titulo}
                author={livro.autor}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
