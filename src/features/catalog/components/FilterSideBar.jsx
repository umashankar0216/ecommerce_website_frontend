import React, { useState, useEffect } from 'react';
import { publicAPI } from '../../../service/api/apiClient'; // Relative import to public API
import './FilterSidebar.css';

export default function FilterSidebar({ initialFilters, onApplyFilters, onClearFilters }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialFilters.categoryId || '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');

  // Fetch available categories for the dropdown selector
  useEffect(() => {
    publicAPI.getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories in filter sidebar', err));
  }, []);

  // Sync internal state if initialFilters prop changes externally
  useEffect(() => {
    setSelectedCategoryId(initialFilters.categoryId || '');
    setMinPrice(initialFilters.minPrice || '');
    setMaxPrice(initialFilters.maxPrice || '');
  }, [initialFilters]);

  const handleApply = (e) => {
    e.preventDefault();
    onApplyFilters({
      categoryId: selectedCategoryId || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  };

  const handleReset = () => {
    setSelectedCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    onClearFilters();
  };

  return (
    <aside className="filter-sidebar">
      <h3 className="filter-title">Filters</h3>

      <form onSubmit={handleApply}>
        {/* Category Filter */}
        <div className="filter-group">
          <label htmlFor="category-select" className="filter-label">Category</label>
          <select
            id="category-select"
            className="filter-select"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group" style={{ marginTop: '1rem' }}>
          <label className="filter-label">Price Range ($)</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              className="price-input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder="Max"
              className="price-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button type="submit" className="btn-apply">
            Apply Filters
          </button>
          <button type="button" onClick={handleReset} className="btn-clear">
            Clear Filters
          </button>
        </div>
      </form>
    </aside>
  );
}