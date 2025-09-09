import express from 'express';
import auth from '../middleware/auth.js';
import nutritionService from '../services/nutritionService.js';

const router = express.Router();

// @route   POST /api/nutrition/search
// @desc    Search for food items
// @access  Private
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
    }

    const results = await nutritionService.searchFood(query);

    res.json({
      results,
      query
    });
  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({ message: 'Server error searching for food items' });
  }
});

// @route   POST /api/nutrition/data
// @desc    Get nutrition data for a food item
// @access  Private
router.post('/data', auth, async (req, res) => {
  try {
    const { foodName, quantity, unit } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: 'Food name is required' });
    }

    const nutritionData = await nutritionService.getNutritionData(
      foodName,
      quantity || 100,
      unit || 'g'
    );

    res.json({
      foodName,
      quantity: quantity || 100,
      unit: unit || 'g',
      nutrition: nutritionData
    });
  } catch (error) {
    console.error('Get nutrition data error:', error);
    res.status(500).json({ message: 'Server error fetching nutrition data' });
  }
});

export default router;
