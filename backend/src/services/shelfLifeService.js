import ShelfLife from '../models/ShelfLife.js';

// Default shelf life data for common food items
const defaultShelfLifeData = [
  // Fruits
  { name: 'apple', category: 'fruits', shelfLife: { refrigerator: 30, freezer: 240, pantry: 7, counter: 7 }, storageRecommendation: 'refrigerator' },
  { name: 'banana', category: 'fruits', shelfLife: { refrigerator: 7, freezer: 60, pantry: 3, counter: 3 }, storageRecommendation: 'counter' },
  { name: 'orange', category: 'fruits', shelfLife: { refrigerator: 14, freezer: 120, pantry: 7, counter: 7 }, storageRecommendation: 'refrigerator' },
  { name: 'strawberry', category: 'fruits', shelfLife: { refrigerator: 3, freezer: 180, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'grape', category: 'fruits', shelfLife: { refrigerator: 7, freezer: 180, pantry: 3, counter: 3 }, storageRecommendation: 'refrigerator' },
  
  // Vegetables
  { name: 'carrot', category: 'vegetables', shelfLife: { refrigerator: 21, freezer: 300, pantry: 7, counter: 7 }, storageRecommendation: 'refrigerator' },
  { name: 'lettuce', category: 'vegetables', shelfLife: { refrigerator: 7, freezer: 30, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'tomato', category: 'vegetables', shelfLife: { refrigerator: 7, freezer: 60, pantry: 3, counter: 3 }, storageRecommendation: 'counter' },
  { name: 'onion', category: 'vegetables', shelfLife: { refrigerator: 30, freezer: 180, pantry: 30, counter: 30 }, storageRecommendation: 'pantry' },
  { name: 'potato', category: 'vegetables', shelfLife: { refrigerator: 60, freezer: 180, pantry: 30, counter: 30 }, storageRecommendation: 'pantry' },
  
  // Dairy
  { name: 'milk', category: 'dairy', shelfLife: { refrigerator: 7, freezer: 90, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'cheese', category: 'dairy', shelfLife: { refrigerator: 30, freezer: 180, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'yogurt', category: 'dairy', shelfLife: { refrigerator: 14, freezer: 60, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'butter', category: 'dairy', shelfLife: { refrigerator: 30, freezer: 270, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'eggs', category: 'dairy', shelfLife: { refrigerator: 30, freezer: 180, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  
  // Meat
  { name: 'chicken', category: 'meat', shelfLife: { refrigerator: 2, freezer: 270, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'beef', category: 'meat', shelfLife: { refrigerator: 3, freezer: 270, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'pork', category: 'meat', shelfLife: { refrigerator: 3, freezer: 270, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  { name: 'fish', category: 'seafood', shelfLife: { refrigerator: 2, freezer: 180, pantry: 1, counter: 1 }, storageRecommendation: 'refrigerator' },
  
  // Grains
  { name: 'bread', category: 'bakery', shelfLife: { refrigerator: 7, freezer: 90, pantry: 5, counter: 3 }, storageRecommendation: 'pantry' },
  { name: 'rice', category: 'grains', shelfLife: { refrigerator: 180, freezer: 365, pantry: 365, counter: 30 }, storageRecommendation: 'pantry' },
  { name: 'pasta', category: 'grains', shelfLife: { refrigerator: 180, freezer: 365, pantry: 365, counter: 30 }, storageRecommendation: 'pantry' },
  
  // Other
  { name: 'canned food', category: 'canned', shelfLife: { refrigerator: 365, freezer: 365, pantry: 1095, counter: 365 }, storageRecommendation: 'pantry' },
  { name: 'frozen food', category: 'frozen', shelfLife: { refrigerator: 1, freezer: 365, pantry: 1, counter: 1 }, storageRecommendation: 'freezer' }
];

class ShelfLifeService {
  // Initialize default shelf life data
  static async initializeDefaultData() {
    try {
      const count = await ShelfLife.countDocuments();
      if (count === 0) {
        await ShelfLife.insertMany(defaultShelfLifeData);
        console.log('✅ Default shelf life data initialized');
      }
    } catch (error) {
      console.error('❌ Error initializing shelf life data:', error);
    }
  }

  // Get shelf life for a food item
  static async getShelfLife(foodName, storageLocation = 'refrigerator') {
    try {
      const normalizedName = foodName.toLowerCase().trim();
      
      // Try exact match first
      let shelfLifeData = await ShelfLife.findOne({ 
        name: normalizedName, 
        isActive: true 
      });

      // If no exact match, try partial match
      if (!shelfLifeData) {
        shelfLifeData = await ShelfLife.findOne({
          name: { $regex: normalizedName, $options: 'i' },
          isActive: true
        });
      }

      if (shelfLifeData) {
        return {
          shelfLife: shelfLifeData.shelfLife[storageLocation] || shelfLifeData.shelfLife.refrigerator,
          storageRecommendation: shelfLifeData.storageRecommendation,
          notes: shelfLifeData.notes
        };
      }

      // Return default shelf life based on category if no specific data found
      return this.getDefaultShelfLifeByCategory(normalizedName, storageLocation);
    } catch (error) {
      console.error('Error getting shelf life:', error);
      return { shelfLife: 7, storageRecommendation: 'refrigerator' }; // Default fallback
    }
  }

  // Get default shelf life by category
  static getDefaultShelfLifeByCategory(foodName, storageLocation = 'refrigerator') {
    const categoryDefaults = {
      fruits: { refrigerator: 7, freezer: 180, pantry: 3, counter: 3 },
      vegetables: { refrigerator: 7, freezer: 180, pantry: 5, counter: 3 },
      dairy: { refrigerator: 7, freezer: 90, pantry: 1, counter: 1 },
      meat: { refrigerator: 3, freezer: 270, pantry: 1, counter: 1 },
      poultry: { refrigerator: 2, freezer: 270, pantry: 1, counter: 1 },
      seafood: { refrigerator: 2, freezer: 180, pantry: 1, counter: 1 },
      grains: { refrigerator: 30, freezer: 365, pantry: 365, counter: 30 },
      nuts: { refrigerator: 90, freezer: 365, pantry: 180, counter: 30 },
      legumes: { refrigerator: 7, freezer: 180, pantry: 365, counter: 7 },
      beverages: { refrigerator: 30, freezer: 365, pantry: 365, counter: 30 },
      snacks: { refrigerator: 30, freezer: 180, pantry: 90, counter: 30 },
      condiments: { refrigerator: 90, freezer: 180, pantry: 180, counter: 30 },
      frozen: { refrigerator: 1, freezer: 365, pantry: 1, counter: 1 },
      canned: { refrigerator: 365, freezer: 365, pantry: 1095, counter: 365 },
      bakery: { refrigerator: 7, freezer: 90, pantry: 5, counter: 3 },
      other: { refrigerator: 7, freezer: 90, pantry: 7, counter: 3 }
    };

    // Try to determine category from food name
    let category = 'other';
    for (const [cat, foods] of Object.entries(categoryKeywords)) {
      if (foods.some(keyword => foodName.includes(keyword))) {
        category = cat;
        break;
      }
    }

    return {
      shelfLife: categoryDefaults[category]?.[storageLocation] || 7,
      storageRecommendation: this.getDefaultStorageRecommendation(category),
      notes: `Default shelf life for ${category}`
    };
  }

  // Get default storage recommendation by category
  static getDefaultStorageRecommendation(category) {
    const storageRecommendations = {
      fruits: 'refrigerator',
      vegetables: 'refrigerator',
      dairy: 'refrigerator',
      meat: 'refrigerator',
      poultry: 'refrigerator',
      seafood: 'refrigerator',
      grains: 'pantry',
      nuts: 'pantry',
      legumes: 'pantry',
      beverages: 'pantry',
      snacks: 'pantry',
      condiments: 'pantry',
      frozen: 'freezer',
      canned: 'pantry',
      bakery: 'pantry',
      other: 'refrigerator'
    };

    return storageRecommendations[category] || 'refrigerator';
  }

  // Add new shelf life data
  static async addShelfLifeData(data) {
    try {
      const shelfLifeData = new ShelfLife(data);
      await shelfLifeData.save();
      return shelfLifeData;
    } catch (error) {
      console.error('Error adding shelf life data:', error);
      throw error;
    }
  }

  // Get all shelf life data
  static async getAllShelfLifeData() {
    try {
      return await ShelfLife.find({ isActive: true }).sort({ name: 1 });
    } catch (error) {
      console.error('Error getting shelf life data:', error);
      throw error;
    }
  }
}

// Category keywords for automatic categorization
const categoryKeywords = {
  fruits: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'peach', 'pear', 'plum', 'cherry', 'lemon', 'lime', 'mango', 'pineapple', 'watermelon', 'cantaloupe'],
  vegetables: ['carrot', 'lettuce', 'tomato', 'onion', 'potato', 'broccoli', 'cauliflower', 'spinach', 'cucumber', 'pepper', 'celery', 'cabbage', 'corn', 'peas', 'beans', 'asparagus', 'zucchini'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'mozzarella', 'cheddar', 'parmesan'],
  meat: ['beef', 'pork', 'lamb', 'veal', 'steak', 'chop', 'roast'],
  poultry: ['chicken', 'turkey', 'duck', 'hen', 'rooster'],
  seafood: ['fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'mussel', 'oyster', 'scallop'],
  grains: ['rice', 'pasta', 'noodle', 'quinoa', 'barley', 'oats', 'wheat', 'bread', 'flour'],
  nuts: ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'peanut'],
  legumes: ['bean', 'lentil', 'chickpea', 'soybean', 'pea'],
  beverages: ['juice', 'soda', 'water', 'tea', 'coffee', 'beer', 'wine'],
  snacks: ['chip', 'cracker', 'cookie', 'candy', 'chocolate', 'popcorn'],
  condiments: ['sauce', 'ketchup', 'mustard', 'mayo', 'vinegar', 'oil', 'spice', 'herb'],
  frozen: ['frozen', 'ice cream', 'popsicle'],
  canned: ['canned', 'jarred', 'preserved'],
  bakery: ['bread', 'roll', 'bagel', 'muffin', 'cake', 'pie', 'croissant']
};

export default ShelfLifeService;
