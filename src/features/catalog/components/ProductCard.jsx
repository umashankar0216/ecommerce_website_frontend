import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  // Safely extract the first image from imageUrls array
  const displayImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : 'https://placehold.co/300x300?text=No+Image';

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      {/* Product Image Frame */}
      <div className="product-image-container">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="product-image" 
        />
        {product.categoryName && (
          <span className="product-category-badge">
            {product.categoryName}
          </span>
        )}
      </div>

      {/* Product Information Area */}
      <div className="product-info-container">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-bottom-row">
          <span className="product-price">
            ${product.basePrice != null ? product.basePrice : '0.00'}
          </span>
          <span className="product-action-btn">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}