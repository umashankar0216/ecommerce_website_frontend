import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPromptModal.css';

function LoginPromptModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  // Don't render anything if the modal state is false
  if (!isOpen) return null;

  const handleGoToLogin = () => {
    onClose(); // Close modal state
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation prevents clicking inside the white box from closing the modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Login Required</h3>
        <p>Please log in to your account to add items to your shopping cart.</p>
        
        <div className="modal-actions">
          <button className="btn-modal-login" onClick={handleGoToLogin}>
            Go to Login
          </button>
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
export default LoginPromptModal;