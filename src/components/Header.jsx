import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Package, MapPin } from 'lucide-react';
import styles from './Header.module.css';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      setUsername(localStorage.getItem('username') || '');
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent full page reload
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  return (
    <header className={styles.header}>
      {/* Logo */}
      <Link to="/" className={styles.logo}>
        E-SHOP
      </Link>

      {/* Centralized Search Form */}
      <form onSubmit={handleSearchSubmit} className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Search for products, brands and categories..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </form>

      {/* Nav Actions */}
      <nav className={styles.navLinks}>
        <Link to="/orders" className={styles.navLink}>
          <Package className={styles.icon} />
          <span>My Orders</span>
        </Link>
        
        <Link to="/addresses" className={styles.navLink}>
          <MapPin className={styles.icon} />
          <span>Address</span>
        </Link>
        
        {isLoggedIn ? (
          <div className={styles.userSession}>
            <Link to="/profile" className={styles.usernameLink} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', marginRight: '1rem' }}>
              Hi, {username}
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className={styles.navLink}>
            <User className={styles.icon} />
            <span>Login</span>
          </Link>
        )}
        
        <Link to="/cart" className={styles.navLink}>
          <ShoppingCart className={styles.icon} />
          <span>Cart</span>
        </Link>
      </nav>
    </header>
  );
}

export default Header;