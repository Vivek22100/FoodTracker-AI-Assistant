import FoodItem from '../models/FoodItem.js';

class MockAIService {
  constructor() {
    this.model = 'mock-ai-service';
  }

  // Process general chat messages
  async processMessage(message, userId, context = {}) {
    try {
      const userContext = await this.getUserContext(userId);
      
      // Mock responses based on common food questions
      const responses = {
        'chicken': '1. **Season chicken** with salt, pepper, garlic powder\n2. **Heat oil** in pan, cook 6-7 minutes per side\n3. **Add spinach** and tomatoes, cook 2-3 minutes\n4. **Serve hot** with rice or pasta',
        'herbs': '1. **Trim ends:** Remove damaged parts\n2. **Wrap loosely:** Use damp paper towel, place in plastic bag\n3. **Refrigerate:** Store in crisper drawer\n4. **Alternative:** Place stems in glass of water',
        'meal prep': '1. **Plan meals** for the week\n2. **Cook proteins** in bulk (chicken, beans)\n3. **Chop vegetables** and store in containers\n4. **Portion snacks** into grab-and-go bags',
        'breakfast': '1. **Overnight oats:** Mix oats, milk, fruit, refrigerate overnight\n2. **Smoothie bowls:** Blend frozen fruit, top with granola\n3. **Egg muffins:** Bake eggs with veggies in muffin tin\n4. **Avocado toast:** Mash avocado on whole grain bread',
        'food waste': '1. **Meal plan** before shopping\n2. **Store properly** to extend shelf life\n3. **Use leftovers** in new dishes\n4. **Compost** scraps for garden',
        'storage': '1. **Keep dry items** in airtight containers\n2. **Refrigerate perishables** at proper temperature\n3. **Freeze extras** to extend shelf life\n4. **Label containers** with dates',
        'recipe': '1. **Check ingredients** you have on hand\n2. **Choose simple recipes** for quick meals\n3. **Prep ingredients** before cooking\n4. **Season to taste** and adjust as needed',
        'nutrition': '1. **Eat variety** of colorful fruits and vegetables\n2. **Include protein** in every meal\n3. **Choose whole grains** over refined\n4. **Stay hydrated** with water throughout day',
        'cooking': '1. **Prep ingredients** before starting\n2. **Use proper heat** for different foods\n3. **Taste and adjust** seasoning as you cook\n4. **Clean as you go** to stay organized',
        'shopping': '1. **Make a list** before going to store\n2. **Check expiration dates** before buying\n3. **Buy seasonal produce** for best quality\n4. **Avoid impulse purchases** of perishables',
        'default': '1. **Plan ahead** for better food management\n2. **Store properly** to extend freshness\n3. **Use leftovers** creatively\n4. **Track expiration** dates regularly'
      };

      // Find matching response with better keyword detection
      const lowerMessage = message.toLowerCase();
      let response = responses.default;
      
      // Check for specific keywords in order of priority
      const keywordMap = {
        'chicken': ['chicken', 'poultry', 'breast', 'thigh', 'wing'],
        'herbs': ['herbs', 'herb', 'basil', 'parsley', 'cilantro', 'rosemary'],
        'meal prep': ['meal prep', 'meal planning', 'weekly prep', 'batch cooking'],
        'breakfast': ['breakfast', 'morning meal', 'oats', 'cereal', 'pancakes'],
        'food waste': ['food waste', 'waste', 'leftovers', 'throw away', 'compost'],
        'storage': ['store', 'storage', 'fridge', 'refrigerator', 'freeze', 'freezer'],
        'recipe': ['recipe', 'cook', 'make', 'prepare', 'dish', 'meal'],
        'nutrition': ['nutrition', 'healthy', 'vitamins', 'protein', 'calories'],
        'cooking': ['cooking', 'cook', 'bake', 'fry', 'boil', 'steam'],
        'shopping': ['shopping', 'grocery', 'buy', 'purchase', 'store visit', 'grocery store', 'what should i buy']
      };
      
      // Find the best matching category with improved logic
      let bestMatch = 'default';
      let maxMatches = 0;
      
      for (const [category, keywords] of Object.entries(keywordMap)) {
        const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatch = category;
        }
      }
      
      response = responses[bestMatch] || responses.default;

      return response;
    } catch (error) {
      console.error("Mock AI service error:", error);
      return "I'm here to help with food-related questions! Ask me about storage, recipes, or meal planning.";
    }
  }

  // Diagnostics
  async diagnostics() {
    return {
      tokenLoaded: true,
      model: this.model,
      apiAccess: { ok: true },
      ok: true
    };
  }

  // Get user context
  async getUserContext(userId) {
    try {
      const foodItems = await FoodItem.find({ userId }).limit(10).sort({ createdAt: -1 });
      const expiringItems = foodItems.filter(item => {
        const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
      });

      let context = `User has ${foodItems.length} food items in their inventory.`;
      
      if (expiringItems.length > 0) {
        context += ` Items expiring soon: ${expiringItems.map(item => item.name).join(', ')}.`;
      }

      return context;
    } catch (error) {
      console.error('Error getting user context:', error);
      return 'User context unavailable.';
    }
  }

  // Analyze food text
  async analyzeFoodText(text, userId) {
    try {
      // Simple mock analysis
      const mockResponse = {
        foodItems: [
          {
            name: "Sample Food Item",
            quantity: "1 piece",
            expiryDate: "2024-01-20",
            category: "general",
            notes: "Extracted from text"
          }
        ],
        confidence: "medium"
      };

      return mockResponse;
    } catch (error) {
      console.error('Error analyzing food text:', error);
      return {
        foodItems: [],
        confidence: "low",
        error: "Analysis failed"
      };
    }
  }

  // Suggest recipes
  async suggestRecipes(foodItems, userId) {
    try {
      const foodNames = foodItems.map(item => item.name).join(', ');
      
      return [
        {
          name: "Quick Stir Fry",
          ingredients: [foodNames],
          instructions: "1. Heat oil in pan\n2. Add ingredients\n3. Stir-fry 5-7 minutes\n4. Season and serve",
          cookingTime: "10 minutes",
          difficulty: "easy"
        },
        {
          name: "Simple Salad",
          ingredients: [foodNames],
          instructions: "1. Chop ingredients\n2. Mix in bowl\n3. Add dressing\n4. Toss and serve",
          cookingTime: "5 minutes",
          difficulty: "easy"
        }
      ];
    } catch (error) {
      console.error('Error suggesting recipes:', error);
      return [{
        name: "Simple Recipe",
        ingredients: [foodNames],
        instructions: "Use your creativity to combine these ingredients into a delicious meal.",
        cookingTime: "15 minutes",
        difficulty: "easy"
      }];
    }
  }

  // Validate food item
  validateFoodItem(foodItem) {
    const errors = [];

    if (!foodItem.name || foodItem.name.trim().length === 0) {
      errors.push('Food name is required');
    }

    if (!foodItem.expiryDate) {
      errors.push('Expiry date is required');
    } else {
      const expiryDate = new Date(foodItem.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        errors.push('Invalid expiry date format');
      } else if (expiryDate < new Date()) {
        errors.push('Expiry date cannot be in the past');
      }
    }

    if (foodItem.quantity && foodItem.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new MockAIService();
