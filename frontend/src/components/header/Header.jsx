import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Header.module.css'
import logo from '../../assets/Logo.png'
import { Profile } from '../profile/Profile.user'

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const debounceTimerRef = useRef(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    const admin = localStorage.getItem('admin')
    setIsLoggedIn(!!(user || admin))

    const handleStorageChange = () => {
      const user = localStorage.getItem('user')
      const admin = localStorage.getItem('admin')
      setIsLoggedIn(!!(user || admin))
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userChange', handleStorageChange)
    window.addEventListener('adminChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userChange', handleStorageChange)
      window.removeEventListener('adminChange', handleStorageChange)
    }
  }, [])

  // Busca em tempo real com debounce
  const fetchSuggestions = useCallback(async (searchQuery = '') => {
    const normalizedQuery = searchQuery.trim()
    setLoadingSuggestions(true)
    try {
      const endpoint = normalizedQuery
        ? `/api/search?q=${encodeURIComponent(normalizedQuery)}`
        : '/api/admin/livros'
      const res = await fetch(`http://localhost:3001${endpoint}`)
      const text = await res.text()
      const parsed = text ? JSON.parse(text) : null
      const data = normalizedQuery ? parsed?.results : parsed
      setSuggestions(Array.isArray(data) ? data.filter((livro) => livro.ativo !== false).slice(0, 5) : [])
    } catch (e) {
      console.error('Erro ao buscar sugestões:', e)
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  function handleSearchFocus() {
    setShowSuggestions(true)
    if (suggestions.length === 0) fetchSuggestions(query)
  }

  function handleInputChange(e) {
    const val = e.target.value
    setQuery(val)
    
    clearTimeout(debounceTimerRef.current)
    if (val.trim() && val.trim().length > 0) {
      setShowSuggestions(true)
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(val)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  function handleSuggestionClick(livro) {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    navigate(`/resenha?livroId=${livro.id}`)
  }

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function doSearch() {
    const q = query.trim()
    if (!q) return
    navigate(`/busca?q=${encodeURIComponent(q)}`)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logoContainer}>
        <img src={logo} alt="Estante Aberta Logo" className={styles.logoImage} />
        <span className={styles.logoText}>Estante Aberta</span>
      </Link>

      <div className={styles.searchContainer}>
        <div className={styles.searchBar} role="search">
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Busque por título, autor, editora, ISBN..."
              className={styles.searchInput}
              aria-label="Buscar livros"
              value={query}
              onChange={handleInputChange}
              onFocus={handleSearchFocus}
              onKeyDown={(e) => { if (e.key === 'Enter') doSearch() }}
            />
            {query && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false) }}
                aria-label="Limpar busca"
              >
                ×
              </button>
            )}

            {showSuggestions && (loadingSuggestions || suggestions.length > 0) && (
              <div className={styles.suggestionsDropdown} ref={suggestionsRef} role="listbox">
                {loadingSuggestions && <div className={styles.suggestionLoading}>Carregando livros...</div>}
                {!loadingSuggestions && suggestions.map((livro) => (
                  <button
                    key={livro.id}
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(livro)}
                    type="button"
                    role="option"
                  >
                    <img 
                      src={livro.fotoCapa ? `http://localhost:3001${livro.fotoCapa}` : '/placeholder.png'}
                      alt={livro.titulo}
                      className={styles.suggestionImage}
                    />
                    <div className={styles.suggestionInfo}>
                      <div className={styles.suggestionTitle}>{livro.titulo}</div>
                      <div className={styles.suggestionAuthor}>{livro.autor}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className={styles.searchButton} aria-label="Pesquisar livros" onClick={doSearch}>
            <span>Buscar</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>

        </div>
      </div>

      <div className={styles.authContainer}>
        {isLoggedIn ? (
          <Profile />
        ) : (
          <>
            <Link to="/login" className={`${styles.authButton} ${styles.loginButton}`}>Login</Link>
            <Link to="/cadastro" className={`${styles.authButton} ${styles.registerButton}`}>Cadastro</Link>
          </>
        )}
      </div>
    </header>
  )
}