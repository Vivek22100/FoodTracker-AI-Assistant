import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { foodAPI } from '../api/food';
import FoodCard from '../components/FoodCard';
import Chatbot from '../components/Chatbot';
import './Dashboard.css';

const Dashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const data = await foodAPI.getAllFoodItems();
      setFoodItems(data);
    } catch (error) {
      setError('Failed to fetch food items');
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      await foodAPI.deleteFoodItem(id);
      setFoodItems(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting food item:', error);
      alert('Failed to delete food item');
    }
  };

  const categorizeFoodItems = (items) => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    return {
      fresh: items.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        return expiryDate > threeDaysFromNow;
      }),
      expiringSoon: items.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= threeDaysFromNow && expiryDate >= now;
      }),
      expired: items.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        return expiryDate < now;
      })
    };
  };

  const { fresh, expiringSoon, expired } = categorizeFoodItems(foodItems);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your food inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchFoodItems} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Food Inventory Dashboard</h1>
        <div className="dashboard-actions">
          <Link to="/add-food" className="add-food-button">
            + Add Food Item
          </Link>
          <button 
            className="chatbot-toggle"
            onClick={() => setShowChatbot(!showChatbot)}
          >
            {showChatbot ? 'Hide' : 'Show'} AI Assistant
          </button>
        </div>
      </div>

      {showChatbot && (
        <div className="chatbot-section">
          <Chatbot />
        </div>
      )}

      <div className="food-categories">
        <div className="category-section">
          <div className="category-header fresh">
            <h2>✅ Fresh ({fresh.length})</h2>
            <p>Items that are still fresh and good to consume</p>
          </div>
          <div className="food-grid">
            {fresh.length > 0 ? (
              fresh.map(item => (
                <FoodCard 
                  key={item._id} 
                  item={item} 
                  onDelete={handleDeleteFood}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No fresh items in your inventory</p>
                <Link to="/add-food" className="add-first-item">
                  Add your first food item
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="category-section">
          <div className="category-header expiring">
            <h2>⚠️ Expiring Soon ({expiringSoon.length})</h2>
            <p>Items that will expire within the next 3 days</p>
          </div>
          <div className="food-grid">
            {expiringSoon.length > 0 ? (
              expiringSoon.map(item => (
                <FoodCard 
                  key={item._id} 
                  item={item} 
                  onDelete={handleDeleteFood}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No items expiring soon</p>
              </div>
            )}
          </div>
        </div>

        <div className="category-section">
          <div className="category-header expired">
            <h2>❌ Expired ({expired.length})</h2>
            <p>Items that have passed their expiry date</p>
          </div>
          <div className="food-grid">
            {expired.length > 0 ? (
              expired.map(item => (
                <FoodCard 
                  key={item._id} 
                  item={item} 
                  onDelete={handleDeleteFood}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No expired items</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

