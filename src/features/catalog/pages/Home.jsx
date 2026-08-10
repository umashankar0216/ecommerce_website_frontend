import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from './../components/Banner';
import { publicAPI } from '../../../service/api/apiClient';
import './../components/Home.css'; 
import OfferBanner from '../../../components/OfferBanner';
import ProductCard from './../components/ProductCard'; // 👈 Imported ProductCard

export default function Home() {
  // Categories State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size] = useState(8);

  useEffect(() => {
    // 1. Fetch Categories
    publicAPI.getCategories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load categories');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // 2. Fetch Dashboard Products (Paginated)
    setProductsLoading(true);
    publicAPI.getProducts({ page, size })
      .then((data) => {
        const productList = data.content ? data.content : data;
        setProducts(productList);
        setTotalPages(data.totalPages || 0);
        setProductsLoading(false);
      })
      .catch((err) => {
        setProductsError(err.message || 'Failed to load products');
        setProductsLoading(false);
      });
  }, [page]);

  return (
    <div className="home-container">
      {/* Offers Fixed Banner Row */}
      <Banner />
      
      {/* DYNAMIC CATEGORIES CONTAINER */}
      <div className="categories-section">
        <h2 className="categories-header">Shop by Categories</h2>
        
        {loading && (
          <div className="loading-wrapper">
            <p className="loading-message">Loading categories...</p>
          </div>
        )}

        {error && (
          <div className="error-wrapper">
            Could not load categories. Ensure Spring Boot is running on port 8080.
          </div>
        )}

        {!loading && !error && (
          <div className="categories-layout-grid">
            {categories.map((category) => (
              <Link 
                to={`/category/${category.id}`} 
                key={category.id} 
                className="category-item-card"
              >
                <div className="category-image-circle">
                  <img 
                    src={category.imageUrl || "https://placehold.co/150"} 
                    alt={category.name} 
                    className="category-image-element"
                  />
                </div>
                <span className="category-label-text">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <OfferBanner />

      {/* 🛒 FEATURED PRODUCTS CATALOG SECTION */}
      <div className="products-section">
        <h2 className="products-header">Featured Products</h2>

        {productsLoading && (
          <div className="loading-wrapper">
            <p className="loading-message">Loading products...</p>
          </div>
        )}

        {productsError && (
          <div className="error-wrapper">
            Could not load products: {productsError}
          </div>
        )}

        {!productsLoading && !productsError && (
          <>
            <div className="products-layout-grid">
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

        {!productsLoading && !productsError && products.length === 0 && (
          <div className="empty-products-box">
            <p>No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}