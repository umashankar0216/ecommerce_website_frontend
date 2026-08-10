import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicAPI } from '../../../service/api/apiClient';
import ProductCard from '../components/ProductCard'; // Relative path inside modular folder
import './CategoryProductsPage.css';

export default function CategoryProductsPage() {
  const { categoryId } = useParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size] = useState(8);

  // Reset page when categoryId changes
  useEffect(() => {
    setPage(0);
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    publicAPI.getProducts({ categoryId, page, size })
      .then((data) => {
        const productList = data.content ? data.content : data;
        setProducts(productList);
        setTotalPages(data.totalPages || 0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch products for this category');
        setLoading(false);
      });
  }, [categoryId, page]);

  return (
    <div className="category-products-wrapper">
      <div className="breadcrumb-navigation">
        <Link to="/" className="back-home-link">
          &larr; Back to Home
        </Link>
      </div>

      <h1 className="category-page-header">Category Products</h1>

      {loading && (
        <div className="page-loading-box">
          <p className="loading-text">Loading products...</p>
        </div>
      )}

      {error && (
        <div className="page-error-box">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="category-products-grid">
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
        <div className="empty-category-box">
          <p className="empty-category-text">No products found in this category.</p>
          <Link to="/" className="back-home-link">
            Explore other categories &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}