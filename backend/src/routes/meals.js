import express from 'express';
import Meal from '../models/Meal.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const sumTotals = (list = []) =>
  list.reduce(
    (sum, entry) => ({
      calories: sum.calories + (entry.calories || 0),
      protein: sum.protein + (entry.protein || 0),
      carbs: sum.carbs + (entry.carbs || 0),
      fat: sum.fat + (entry.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

// POST /api/meals - save a meal
router.post('/', auth, async (req, res) => {
  try {
    const { mealType, description, items = [], eatenAt } = req.body;

    if (!mealType || !description || !description.trim()) {
      return res.status(400).json({ message: 'Meal type and description are required' });
    }

    const meal = await Meal.create({
      user: req.user._id,
      mealType,
      description,
      items,
      totals: sumTotals(items),
      eatenAt: eatenAt || Date.now(),
    });

    res.status(201).json({ meal });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Create meal error:', error);
    res.status(500).json({ message: 'Server error saving meal' });
  }
});

// GET /api/meals?start=...&end=... - meals in a time range, plus totals
router.get('/', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    const from = start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const to = end ? new Date(end) : new Date();

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date' });
    }

    const meals = await Meal.find({
      user: req.user._id,
      eatenAt: { $gte: from, $lte: to },
    }).sort({ eatenAt: 1 });

    res.json({ meals, totals: sumTotals(meals.map((meal) => meal.totals)) });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ message: 'Server error fetching meals' });
  }
});

// DELETE /api/meals/:id - delete one of your meals
router.delete('/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ message: 'Meal deleted' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ message: 'Server error deleting meal' });
  }
});

export default router;