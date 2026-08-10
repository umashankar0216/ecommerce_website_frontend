import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeaderSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent full page reload
    
    if (searchTerm.trim()) {
      // Redirect to search results page with 'q' query parameter
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="search-form">
      <input
        type="text"
        placeholder="Search for products, categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
}