import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    items: [
      {
        name: String,
        quantity: String,
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
      },
    ],
    totals: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    eatenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Meal', mealSchema);