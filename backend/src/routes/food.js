import express from 'express';
import FoodItem from '../models/FoodItem.js';
import auth from '../middleware/auth.js';
import { validateFoodItem } from '../middleware/validation.js';
import ShelfLifeService from '../services/shelfLifeService.js';

const router = express.Router();

// @route   GET /api/food
// @desc    Get all food items for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, limit = 50, page = 1 } = req.query;
    
    const query = { user: req.user._id, isConsumed: false };
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    const foodItems = await FoodItem.find(query)
      .sort({ expiryDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by status if provided
    let filteredItems = foodItems;
    if (status) {
      const now = new Date();
      filteredItems = foodItems.filter(item => {
        const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
        
        switch (status) {
          case 'fresh':
            return daysUntilExpiry > 3;
          case 'expiring_soon':
            return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
          case 'expired':
            return daysUntilExpiry < 0;
          default:
            return true;
        }
      });
    }

    const total = await FoodItem.countDocuments(query);

    res.json({
      foodItems: filteredItems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({ message: 'Server error fetching food items' });
  }
});

// @route   GET /api/food/dashboard
// @desc    Get dashboard data (counts by status)
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    const [fresh, expiringSoon, expired] = await Promise.all([
      FoodItem.countDocuments({
        user: req.user._id,
        isConsumed: false,
        expiryDate: { $gt: threeDaysFromNow }
      }),
      FoodItem.countDocuments({
        user: req.user._id,
        isConsumed: false,
        expiryDate: { $gte: now, $lte: threeDaysFromNow }
      }),
      FoodItem.countDocuments({
        user: req.user._id,
        isConsumed: false,
        expiryDate: { $lt: now }
      })
    ]);

    // Get items expiring in the next 3 days
    const expiringItems = await FoodItem.find({
      user: req.user._id,
      isConsumed: false,
      expiryDate: { $gte: now, $lte: threeDaysFromNow }
    }).sort({ expiryDate: 1 }).limit(10);

    res.json({
      counts: {
        fresh,
        expiringSoon,
        expired,
        total: fresh + expiringSoon + expired
      },
      expiringItems
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// @route   GET /api/food/:id
// @desc    Get a specific food item
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const foodItem = await FoodItem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json(foodItem);
  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({ message: 'Server error fetching food item' });
  }
});

// @route   POST /api/food
// @desc    Add a new food item
// @access  Private
router.post('/', auth, validateFoodItem, async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      purchaseDate,
      expiryDate,
      storageLocation,
      notes,
      tags
    } = req.body;

    // If no expiry date provided, calculate it using shelf life
    let calculatedExpiryDate = expiryDate;
    let shelfLife = null;

    if (!expiryDate) {
      const shelfLifeData = await ShelfLifeService.getShelfLife(name, storageLocation);
      shelfLife = shelfLifeData.shelfLife;
      
      const purchase = new Date(purchaseDate || Date.now());
      calculatedExpiryDate = new Date(purchase.getTime() + (shelfLife * 24 * 60 * 60 * 1000));
    }

    const foodItem = new FoodItem({
      user: req.user._id,
      name,
      category,
      quantity,
      purchaseDate: purchaseDate || new Date(),
      expiryDate: calculatedExpiryDate,
      shelfLife,
      storageLocation: storageLocation || 'refrigerator',
      notes,
      tags: tags || []
    });

    await foodItem.save();

    res.status(201).json({
      message: 'Food item added successfully',
      foodItem
    });
  } catch (error) {
    console.error('Add food item error:', error);
    res.status(500).json({ message: 'Server error adding food item' });
  }
});

// @route   PUT /api/food/:id
// @desc    Update a food item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      purchaseDate,
      expiryDate,
      storageLocation,
      notes,
      tags
    } = req.body;

    const foodItem = await FoodItem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Update fields
    if (name) foodItem.name = name;
    if (category) foodItem.category = category;
    if (quantity) foodItem.quantity = quantity;
    if (purchaseDate) foodItem.purchaseDate = purchaseDate;
    if (expiryDate) foodItem.expiryDate = expiryDate;
    if (storageLocation) foodItem.storageLocation = storageLocation;
    if (notes !== undefined) foodItem.notes = notes;
    if (tags) foodItem.tags = tags;

    await foodItem.save();

    res.json({
      message: 'Food item updated successfully',
      foodItem
    });
  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({ message: 'Server error updating food item' });
  }
});

// @route   DELETE /api/food/:id
// @desc    Delete a food item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const foodItem = await FoodItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({ message: 'Server error deleting food item' });
  }
});

// @route   POST /api/food/:id/consume
// @desc    Mark a food item as consumed
// @access  Private
router.post('/:id/consume', auth, async (req, res) => {
  try {
    const foodItem = await FoodItem.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    foodItem.isConsumed = true;
    foodItem.consumedDate = new Date();
    await foodItem.save();

    res.json({
      message: 'Food item marked as consumed',
      foodItem
    });
  } catch (error) {
    console.error('Consume food item error:', error);
    res.status(500).json({ message: 'Server error marking food item as consumed' });
  }
});

// @route   GET /api/food/categories/list
// @desc    Get list of available categories
// @access  Private
router.get('/categories/list', auth, async (req, res) => {
  try {
    const categories = [
      'fruits', 'vegetables', 'dairy', 'meat', 'poultry', 'seafood',
      'grains', 'nuts', 'legumes', 'beverages', 'snacks', 'condiments',
      'frozen', 'canned', 'bakery', 'other'
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// @route   GET /api/food/units/list
// @desc    Get list of available quantity units
// @access  Private
router.get('/units/list', auth, async (req, res) => {
  try {
    const units = [
      'pieces', 'kg', 'g', 'lbs', 'oz', 'l', 'ml', 'cups',
      'tbsp', 'tsp', 'slices', 'cans', 'bottles', 'packages'
    ];

    res.json({ units });
  } catch (error) {
    console.error('Get units error:', error);
    res.status(500).json({ message: 'Server error fetching units' });
  }
});

export default router;
