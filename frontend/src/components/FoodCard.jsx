import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FoodCard.css';

const FoodCard = ({ item, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return { status: 'expired', text: 'Expired', color: '#e74c3c' };
    if (days <= 3) return { status: 'expiring', text: `${days} day${days !== 1 ? 's' : ''} left`, color: '#f39c12' };
    return { status: 'fresh', text: `${days} day${days !== 1 ? 's' : ''} left`, color: '#27ae60' };
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      onDelete(item._id);
    }
  };

  const expiryInfo = getExpiryStatus(item.expiryDate);

  return (
    <div className="food-card">
      <div className="food-card-header">
        <h3 className="food-name">{item.name}</h3>
        <span className="food-category">{item.category}</span>
      </div>

      <div className="food-card-body">
        <div className="food-info">
          <div className="info-row">
            <span className="label">Quantity:</span>
            <span className="value">{item.quantity?.amount} {item.quantity?.unit}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Purchase Date:</span>
            <span className="value">{formatDate(item.purchaseDate)}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Expiry Date:</span>
            <span className="value">{formatDate(item.expiryDate)}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Status:</span>
            <span 
              className="value expiry-status"
              style={{ color: expiryInfo.color }}
            >
              {expiryInfo.text}
            </span>
          </div>
        </div>

        {item.nutrition && (
          <div className="nutrition-info">
            <h4>Nutrition (total for this quantity)</h4>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-label">Calories</span>
                <span className="nutrition-value">{item.nutrition.calories || 'N/A'}</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Protein</span>
                <span className="nutrition-value">{item.nutrition.protein || 'N/A'}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Fat</span>
                <span className="nutrition-value">{item.nutrition.fat || 'N/A'}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Carbs</span>
                <span className="nutrition-value">{item.nutrition.carbohydrates ?? 'N/A'}g</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="food-card-actions">
        <Link 
          to={`/edit-food/${item._id}`} 
          className="action-button edit-button"
        >
          Edit
        </Link>
        <button 
          onClick={handleDelete}
          className="action-button delete-button"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default FoodCard;

