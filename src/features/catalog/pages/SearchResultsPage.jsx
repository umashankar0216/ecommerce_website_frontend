import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicAPI } from '../../../service/api/apiClient'; // Adjust path if needed
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import './SearchResultsPage.css';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read search term from URL query string (?q=...)
  const searchQuery = searchParams.get('q') || '';

  // Local filter states
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || null,
    minPrice: searchParams.get('minPrice') || null,
    maxPrice: searchParams.get('maxPrice') || null,
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size] = useState(8);

  // Reset page when search query or filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, filters]);

  // Fetch products whenever search query, filters, or page changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    const apiParams = {
      search: searchQuery || null,
      categoryId: filters.categoryId || null,
      minPrice: filters.minPrice || null,
      maxPrice: filters.maxPrice || null,
      page,
      size
    };

    publicAPI.getProducts(apiParams)
      .then((data) => {
        const productList = data.content ? data.content : data;
        setProducts(productList);
        setTotalPages(data.totalPages || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch search results');
        setLoading(false);
      });
  }, [searchQuery, filters, page]);

  // Handle applying filters from sidebar
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);

    // Sync updated filters back into browser URL parameters
    const updatedParams = new URLSearchParams(searchParams);
    
    if (newFilters.categoryId) updatedParams.set('categoryId', newFilters.categoryId);
    else updatedParams.delete('categoryId');

    if (newFilters.minPrice) updatedParams.set('minPrice', newFilters.minPrice);
    else updatedParams.delete('minPrice');

    if (newFilters.maxPrice) updatedParams.set('maxPrice', newFilters.maxPrice);
    else updatedParams.delete('maxPrice');

    setSearchParams(updatedParams);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setFilters({ categoryId: null, minPrice: null, maxPrice: null });

    const updatedParams = new URLSearchParams();
    if (searchQuery) updatedParams.set('q', searchQuery);
    setSearchParams(updatedParams);
  };

  return (
    <div className="search-page-container">
      {/* Search Header Info */}
      <div className="search-header-section">
        <h1 className="search-title">
          {searchQuery ? (
            <>Search Results for "<span className="search-query-highlight">{searchQuery}</span>"</>
          ) : (
            'All Products'
          )}
        </h1>
        {!loading && (
          <p className="search-results-count">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        )}
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="search-content-layout">
        
        {/* Left Column: Filter Sidebar */}
        <FilterSidebar
          initialFilters={filters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Right Column: Products Display Area */}
        <main className="search-results-main">
          {loading && (
            <div className="search-loading-box">
              <p className="search-loading-text">Searching for products...</p>
            </div>
          )}

          {error && (
            <div className="search-error-box">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="search-products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    className="btn-secondary"
                    style={{ padding: '0.5rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: page === 0 ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                  >
                    Previous
                  </button>
                  <span className="pagination-info" style={{ fontWeight: '600', color: '#475569' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(prev => prev + 1)}
                    className="btn-secondary"
                    style={{ padding: '0.5rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="search-empty-box">
              <p className="search-empty-text">No products matched your search or filters.</p>
              <p className="search-results-count">Try adjusting your filter options or searching for another term.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}