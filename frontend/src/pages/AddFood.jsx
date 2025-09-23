import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodAPI } from '../api/food';
import { nutritionAPI } from '../api/nutrition';
import './FoodForm.css';

const AddFood = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: {
      amount: '',
      unit: 'pieces'
    },
    purchaseDate: '',
    expiryDate: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);
  const [showNutritionLookup, setShowNutritionLookup] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'fruits',
    'vegetables',
    'dairy',
    'meat',
    'poultry',
    'seafood',
    'grains',
    'nuts',
    'legumes',
    'beverages',
    'snacks',
    'condiments',
    'frozen',
    'canned',
    'bakery',
    'other'
  ];

  const quantityUnits = [
    'pieces',
    'kg',
    'g',
    'lbs',
    'oz',
    'l',
    'ml',
    'cups',
    'tbsp',
    'tsp',
    'slices',
    'cans',
    'bottles',
    'packages'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantityAmount') {
      setFormData(prev => ({
        ...prev,
        quantity: {
          ...prev.quantity,
          amount: value
        }
      }));
    } else if (name === 'quantityUnit') {
      setFormData(prev => ({
        ...prev,
        quantity: {
          ...prev.quantity,
          unit: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Food name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.quantity.amount) {
      newErrors.quantityAmount = 'Quantity amount is required';
    } else if (isNaN(formData.quantity.amount) || parseFloat(formData.quantity.amount) <= 0) {
      newErrors.quantityAmount = 'Quantity must be a positive number';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (formData.purchaseDate && formData.expiryDate) {
      const purchaseDate = new Date(formData.purchaseDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= purchaseDate) {
        newErrors.expiryDate = 'Expiry date must be after purchase date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const foodData = {
        ...formData,
        quantity: {
          amount: parseFloat(formData.quantity.amount),
          unit: formData.quantity.unit
        },
        purchaseDate: new Date(formData.purchaseDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        // Include nutrition data if available
        ...(nutritionData && { nutrition: nutritionData })
      };
      
      await foodAPI.createFoodItem(foodData);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ 
        general: error.message || 'Failed to add food item. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  // Look up nutrition data
  const handleNutritionLookup = async () => {
    if (!formData.name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Food name is required for nutrition lookup' }));
      return;
    }

    setIsLoadingNutrition(true);
    try {
      const data = await nutritionAPI.getNutritionData(
        formData.name,
        parseFloat(formData.quantity.amount) || 100,
        formData.quantity.unit
      );
      setNutritionData(data.nutrition);
      setShowNutritionLookup(true);
    } catch (error) {
      console.error('Nutrition lookup failed:', error);
      setErrors(prev => ({ 
        ...prev, 
        nutrition: 'Failed to fetch nutrition data. You can still add the food item.' 
      }));
    } finally {
      setIsLoadingNutrition(false);
    }
  };

  // Clear nutrition data
  const clearNutritionData = () => {
    setNutritionData(null);
    setShowNutritionLookup(false);
  };

  return (
    <div className="food-form-container">
      <div className="food-form-card">
        <div className="food-form-header">
          <h1>Add Food Item</h1>
          <p>Track a new food item in your inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="food-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Food Name *</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="e.g., Organic Bananas"
                />
                <button
                  type="button"
                  onClick={handleNutritionLookup}
                  disabled={isLoadingNutrition || !formData.name.trim()}
                  className="nutrition-lookup-btn"
                >
                  {isLoadingNutrition ? 'Looking up...' : '🔍 Nutrition'}
                </button>
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
              {errors.nutrition && <span className="error-message">{errors.nutrition}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantityAmount">Quantity *</label>
              <input
                type="number"
                id="quantityAmount"
                name="quantityAmount"
                value={formData.quantity.amount}
                onChange={handleChange}
                className={errors.quantityAmount ? 'error' : ''}
                placeholder="e.g., 2.5"
                step="0.1"
                min="0"
              />
              {errors.quantityAmount && <span className="error-message">{errors.quantityAmount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="quantityUnit">Unit *</label>
              <select
                id="quantityUnit"
                name="quantityUnit"
                value={formData.quantity.unit}
                onChange={handleChange}
                className={errors.quantityUnit ? 'error' : ''}
              >
                {quantityUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {errors.quantityUnit && <span className="error-message">{errors.quantityUnit}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date *</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className={errors.purchaseDate ? 'error' : ''}
              />
              {errors.purchaseDate && <span className="error-message">{errors.purchaseDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date *</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={errors.expiryDate ? 'error' : ''}
              />
              {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
            </div>
          </div>

          {/* Nutrition Data Display */}
          {showNutritionLookup && nutritionData && (
            <div className="nutrition-section">
              <div className="nutrition-header">
                <h3>Nutrition Information</h3>
                <button
                  type="button"
                  onClick={clearNutritionData}
                  className="clear-nutrition-btn"
                >
                  ✕
                </button>
              </div>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="nutrition-label">Calories</span>
                  <span className="nutrition-value">{nutritionData.calories || 'N/A'}</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Protein</span>
                  <span className="nutrition-value">{nutritionData.protein || 'N/A'}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Fat</span>
                  <span className="nutrition-value">{nutritionData.fat || 'N/A'}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Carbs</span>
                  <span className="nutrition-value">{nutritionData.carbohydrates || 'N/A'}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Fiber</span>
                  <span className="nutrition-value">{nutritionData.fiber || 'N/A'}g</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Sugar</span>
                  <span className="nutrition-value">{nutritionData.sugar || 'N/A'}g</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFood;

