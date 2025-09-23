import mongoose from 'mongoose';

const shelfLifeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    unique: true,
    lowercase: true
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
  shelfLife: {
    refrigerator: {
      type: Number, // in days
      required: [true, 'Refrigerator shelf life is required'],
      min: [1, 'Shelf life must be at least 1 day']
    },
    freezer: {
      type: Number, // in days
      required: [true, 'Freezer shelf life is required'],
      min: [1, 'Shelf life must be at least 1 day']
    },
    pantry: {
      type: Number, // in days
      required: [true, 'Pantry shelf life is required'],
      min: [1, 'Shelf life must be at least 1 day']
    },
    counter: {
      type: Number, // in days
      required: [true, 'Counter shelf life is required'],
      min: [1, 'Shelf life must be at least 1 day']
    }
  },
  storageRecommendation: {
    type: String,
    enum: ['refrigerator', 'freezer', 'pantry', 'counter'],
    required: [true, 'Storage recommendation is required']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient lookups
shelfLifeSchema.index({ category: 1 });
shelfLifeSchema.index({ isActive: 1 });

export default mongoose.model('ShelfLife', shelfLifeSchema);
