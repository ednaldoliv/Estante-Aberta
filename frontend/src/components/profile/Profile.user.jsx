import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import { assetUrl } from '../../services/api';

export function Profile() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const adminData = localStorage.getItem('admin');
    
    if (adminData) {
      const admin = JSON.parse(adminData);
      setUser(admin);
      setIsAdmin(true);
    } else if (userData) {
      setUser(JSON.parse(userData));
      setIsAdmin(false);
    }

    // Listener para atualizar quando o usuário mudar
    const handleUserChange = () => {
      const userData = localStorage.getItem('user');
      const adminData = localStorage.getItem('admin');
      
      if (adminData) {
        setUser(JSON.parse(adminData));
        setIsAdmin(true);
      } else if (userData) {
        setUser(JSON.parse(userData));
        setIsAdmin(false);
      }
    };

    window.addEventListener('userChange', handleUserChange);
    window.addEventListener('adminChange', handleUserChange);
    
    return () => {
      window.removeEventListener('userChange', handleUserChange);
      window.removeEventListener('adminChange', handleUserChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('admin');
      window.dispatchEvent(new Event('adminChange'));
      navigate('/admin/login');
    } else {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('userChange'));
      navigate('/login');
    }
  };

  const getInitials = (email, nome) => {
    if (nome && nome.trim().length > 0) return nome.trim().charAt(0).toUpperCase();
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  if (!user) return null;

  return (
    <div className={styles.profileContainer} ref={dropdownRef}>
      <button
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menu do perfil"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Menu do perfil"
      >
        <span className={styles.avatarVisual}>{user.fotoPerfil ? (
          <img 
            src={assetUrl(user.fotoPerfil)} 
            alt=""
            className={styles.avatarImage}
          />
        ) : (
          getInitials(user.email, user.nome)
        )}</span>
        <svg className={styles.avatarChevron} viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div
              className={styles.dropdownAvatar}
            >
              {user.fotoPerfil ? (
                <img 
                  src={assetUrl(user.fotoPerfil)} 
                  alt="Foto de perfil" 
                  className={styles.dropdownAvatarImage}
                />
              ) : (
                getInitials(user.email, user.nome)
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.nome || (user.email ? user.email.split('@')[0] : '')}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>

          <div className={styles.dropdownDivider}></div>

          <button className={styles.dropdownItem} onClick={() => { setIsOpen(false); navigate(isAdmin ? '/admin/dashboard' : '/perfil'); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              {isAdmin ? (
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              ) : (
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              )}
            </svg>
            {isAdmin ? 'Gerenciar site' : 'Ver perfil'}
          </button>

          <button className={styles.dropdownItem} onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
