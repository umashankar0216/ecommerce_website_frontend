import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { publicAPI, cartAPI, reviewAPI } from '../../../service/api/apiClient';
import ImageCarousel from '../components/ImageCarousel';
import VariantSelector from '../components/VariantSelector';
import LoginPromptModal from '../../../components/LoginPromptModal'; // 👈 Import Modal
import './ProductDetailedPage.css';

function ProductDetailedPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImages, setActiveImages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // 🔴 Modal State (Controls visibility)
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch Product details...
  useEffect(() => {
    setLoading(true);
    publicAPI.getProductById(id)
      .then((data) => {
        setProduct(data);
        const validVariants = (data?.variants || []).filter(Boolean);

        if (validVariants.length > 0) {
          const firstVariant = validVariants[0];
          setSelectedColor(firstVariant?.color || '');
          setSelectedSize(firstVariant?.size || '');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch product details', err);
        setLoading(false);
      });
  }, [id]);

  // Fetch Reviews...
  useEffect(() => {
    setReviewsLoading(true);
    reviewAPI.getReviewsByProduct(id)
      .then((data) => {
        if (data) setReviews(data);
      })
      .catch((err) => console.error("Failed to load reviews", err))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  // Update active images when selected variant changes
  useEffect(() => {
    if (!product) return;

    const validVariants = (product.variants || []).filter(Boolean);
    const activeVariant = validVariants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    const defaultImgs = product.imageUrls && product.imageUrls.length > 0 
      ? product.imageUrls 
      : (product.imageUrl ? [product.imageUrl] : []);

    if (activeVariant) {
      const variantImgs = activeVariant.imageUrls && activeVariant.imageUrls.length > 0
        ? activeVariant.imageUrls
        : (activeVariant.imageUrl ? [activeVariant.imageUrl] : defaultImgs);
      setActiveImages(variantImgs);
    } else {
      setActiveImages(defaultImgs);
    }
  }, [selectedColor, selectedSize, product]);

  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    if (!product?.variants) return;
    const colorVariants = product.variants.filter(Boolean).filter((v) => v.color === colorName);
    if (colorVariants.length > 0) {
      setSelectedSize(colorVariants[0]?.size || '');
    }
  };

  const handleSizeChange = (sizeName) => {
    setSelectedSize(sizeName);
  };

  // Calculate Average Rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  // 🛒 Handle Add to Cart
  const handleAddToCart = () => {
    setFeedback(null);

    // 1. Check for token FIRST
    const token = localStorage.getItem('token');
    
    // 🛑 If NO token exists, open modal and EXIT IMMEDIATELY.
    if (!token) {
      setShowLoginModal(true);
      return; 
    }

    // 2. Find selected variant
    const validVariants = (product?.variants || []).filter(Boolean);
    const activeVariant = validVariants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    if (!activeVariant) {
      setFeedback({ type: 'error', message: 'Please select a valid variant.' });
      return;
    }

    // 3. Build payload & set loading state ONLY when authenticated
    const cartPayload = {
      variantId: activeVariant.id,
      quantity: 1,
    };

    setAddingToCart(true);

    // 4. API call executes ONLY if logged in
    cartAPI.addItemToCart(cartPayload)
      .then(() => {
        setFeedback({ type: 'success', message: 'Added to cart successfully!' });
        setAddingToCart(false);
      })
      .catch((err) => {
        setFeedback({ type: 'error', message: err.message || 'Failed to add item to cart.' });
        setAddingToCart(false);
      });
  };

  if (loading) return <div className="pdp-container"><p>Loading...</p></div>;
  if (!product) return <div className="pdp-container"><p>Product not found.</p></div>;

  return (
    <div className="pdp-container">
      <div className="pdp-layout">
        <div className="pdp-media">
          <ImageCarousel images={activeImages} />
        </div>

        <div className="pdp-details">
          {product.categoryName && <span className="pdp-category">{product.categoryName}</span>}
          <h1 className="pdp-title">{product.name}</h1>
          <p className="pdp-price">${product.basePrice?.toFixed(2)}</p>
          <p className="pdp-description">{product.description}</p>

          <VariantSelector
            variants={product.variants || []}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectColor={handleColorChange}
            onSelectSize={handleSizeChange}
          />

          <div className="pdp-actions">
            <button onClick={handleAddToCart} disabled={addingToCart} className="btn-add-cart">
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            {feedback && <div className={`pdp-message ${feedback.type}`}>{feedback.message}</div>}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pdp-reviews-section">
        <h2 className="reviews-title">Customer Reviews ({reviews.length})</h2>
        
        {reviews.length > 0 ? (
          <div className="space-y-4">
            <div className="pdp-rating-summary">
              <div className="stars">
                {'★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating))}
              </div>
              <span className="rating-score">
                {averageRating.toFixed(1)} out of 5
              </span>
            </div>
            
            <div className="reviews-list">
              {reviews.map((rev) => (
                <div key={rev.id} className="review-card">
                  <div className="flex justify-between items-center mb-1">
                    <span className="review-author">{rev.username}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="stars text-sm mb-1.5">
                    {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="review-text">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 font-semibold">
            <p>No reviews yet for this product. Be the first to purchase and review!</p>
          </div>
        )}
      </div>

      {/* 🔒 Reusable Popup Modal */}
      <LoginPromptModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}

export default ProductDetailedPage;