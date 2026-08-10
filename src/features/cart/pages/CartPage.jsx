import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../../../service/api/apiClient';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import './CartPage.css';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = () => {
    setLoading(true);
    cartAPI.getCart()
      .then((data) => {
        setCart(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch cart.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = (cartItemId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;

    cartAPI.updateCartItemQuantity(cartItemId, { quantity: newQty })
      .then((updatedCart) => {
        setCart(updatedCart);
      })
      .catch((err) => {
        alert(err.message || 'Failed to update quantity.');
      });
  };

  const handleRemoveItem = (cartItemId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    cartAPI.removeCartItem(cartItemId)
      .then((updatedCart) => {
        setCart(updatedCart);
      })
      .catch((err) => {
        alert(err.message || 'Failed to remove item.');
      });
  };

  const handleClearCart = () => {
    if (!window.confirm('Are you sure you want to empty your cart?')) return;
    cartAPI.clearCart()
      .then(() => {
        setCart({ items: [], cartTotal: 0 });
      })
      .catch((err) => {
        alert(err.message || 'Failed to clear cart.');
      });
  };

  if (loading && !cart) {
    return <div className="cart-container"><p className="cart-loading">Loading your cart...</p></div>;
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="cart-error">
          <p>Please log in to view your shopping cart.</p>
          <Link to="/login" className="btn-error-login">Go to Login</Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="cart-empty-state">
          <ShoppingBag size={64} className="empty-icon" />
          <h2>Your cart is currently empty</h2>
          <p>Browse our catalog and add items to your cart to start shopping.</p>
          <Link to="/" className="btn-shop-now">Shop Our Catalog</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <span>Product Details</span>
              <button onClick={handleClearCart} className="btn-clear-cart">Clear Cart</button>
            </div>
            
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-media">
                    <img 
                      src={item.imageUrl || "https://placehold.co/100"} 
                      alt={item.productName} 
                      className="cart-item-image"
                    />
                  </div>
                  
                  <div className="cart-item-details">
                    <h3 className="item-name">{item.productName}</h3>
                    <div className="item-variants">
                      {item.color && <span className="variant-badge">Color: {item.color}</span>}
                      {item.size && <span className="variant-badge">Size: {item.size}</span>}
                    </div>
                    <span className="item-unit-price">${item.unitPrice?.toFixed(2)}</span>
                  </div>

                  <div className="cart-item-quantity-control">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} 
                      disabled={item.quantity <= 1}
                      className="btn-qty"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} 
                      className="btn-qty"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    <span className="subtotal-val">${item.subTotal?.toFixed(2)}</span>
                  </div>

                  <div className="cart-item-actions">
                    <button onClick={() => handleRemoveItem(item.id)} className="btn-delete-item" title="Remove item">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cart.cartTotal?.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>${cart.cartTotal?.toFixed(2)}</span>
              </div>

              {/* Converted button to Link */}
              <Link 
                to="/checkout" 
                className="btn-checkout" 
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
              >
                Proceed to Checkout
              </Link>
              
              <Link to="/" className="continue-shopping">Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}