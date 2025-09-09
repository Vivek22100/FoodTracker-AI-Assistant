import mongoose from 'mongoose';

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 }, // in grams
  fat: { type: Number, default: 0 }, // in grams
  carbohydrates: { type: Number, default: 0 }, // in grams
  fiber: { type: Number, default: 0 }, // in grams
  sugar: { type: Number, default: 0 }, // in grams
  sodium: { type: Number, default: 0 }, // in mg
  cholesterol: { type: Number, default: 0 }, // in mg
  vitamins: {
    vitaminA: { type: Number, default: 0 }, // in IU
    vitaminC: { type: Number, default: 0 }, // in mg
    vitaminD: { type: Number, default: 0 }, // in IU
    vitaminE: { type: Number, default: 0 }, // in mg
    vitaminK: { type: Number, default: 0 }, // in mcg
    thiamine: { type: Number, default: 0 }, // in mg
    riboflavin: { type: Number, default: 0 }, // in mg
    niacin: { type: Number, default: 0 }, // in mg
    vitaminB6: { type: Number, default: 0 }, // in mg
    folate: { type: Number, default: 0 }, // in mcg
    vitaminB12: { type: Number, default: 0 }, // in mcg
    biotin: { type: Number, default: 0 }, // in mcg
    pantothenicAcid: { type: Number, default: 0 } // in mg
  },
  minerals: {
    calcium: { type: Number, default: 0 }, // in mg
    iron: { type: Number, default: 0 }, // in mg
    magnesium: { type: Number, default: 0 }, // in mg
    phosphorus: { type: Number, default: 0 }, // in mg
    potassium: { type: Number, default: 0 }, // in mg
    zinc: { type: Number, default: 0 }, // in mg
    copper: { type: Number, default: 0 }, // in mg
    manganese: { type: Number, default: 0 }, // in mg
    selenium: { type: Number, default: 0 } // in mcg
  }
}, { _id: false });

const foodItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    maxlength: [100, 'Food name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
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
    ]
  },
  quantity: {
    amount: {
      type: Number,
      required: [true, 'Quantity amount is required'],
      min: [0.1, 'Quantity must be greater than 0']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: [
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
      ]
    }
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  shelfLife: {
    type: Number, // in days
    default: null
  },
  storageLocation: {
    type: String,
    enum: ['refrigerator', 'freezer', 'pantry', 'counter', 'other'],
    default: 'refrigerator'
  },
  nutrition: {
    type: nutritionSchema,
    default: {}
  },
  nutritionSource: {
    type: String,
    enum: ['api', 'manual', 'estimated'],
    default: 'estimated'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isConsumed: {
    type: Boolean,
    default: false
  },
  consumedDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }]
}, {
  timestamps: true
});

// Index for efficient queries
foodItemSchema.index({ user: 1, expiryDate: 1 });
foodItemSchema.index({ user: 1, category: 1 });
foodItemSchema.index({ user: 1, isConsumed: 1 });

// Virtual for expiry status
foodItemSchema.virtual('expiryStatus').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 3) return 'expiring_soon';
  return 'fresh';
});

// Virtual for days until expiry
foodItemSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
foodItemSchema.set('toJSON', { virtuals: true });
foodItemSchema.set('toObject', { virtuals: true });

export default mongoose.model('FoodItem', foodItemSchema);
