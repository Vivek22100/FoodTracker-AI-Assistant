import { GoogleGenerativeAI } from '@google/generative-ai';
import FoodItem from '../models/FoodItem.js';
import nutritionService from './nutritionService.js';
import ShelfLifeService from './shelfLifeService.js';

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
  }

  // Process general chat messages
  async processMessage(message, userId, context = {}) {
    try {
      const systemPrompt = this.getSystemPrompt();
      const userContext = await this.getUserContext(userId);

      const prompt = `${systemPrompt}\n\nUser Context: ${userContext}\n\nUser: ${message}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("AI service error:", error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  // Diagnostics: verify API key and model access
  async diagnostics() {
    const tokenLoaded = Boolean(process.env.GEMINI_API_KEY);
    const model = process.env.GEMINI_MODEL || 'gemini-pro';

    const result = {
      tokenLoaded,
      model,
      apiAccess: null,
      ok: false
    };

    try {
      if (!tokenLoaded) {
        result.apiAccess = { ok: false, error: 'Missing GEMINI_API_KEY' };
        return result;
      }

      // Test API access with a simple request
      try {
        const testResult = await this.model.generateContent("Hello");
        await testResult.response;
        result.apiAccess = { ok: true };
      } catch (err) {
        result.apiAccess = { 
          ok: false, 
          error: err.message || String(err)
        };
      }

      result.ok = Boolean(result.apiAccess?.ok);
      return result;
    } catch (error) {
      return { ...result, ok: false, error: error.message };
    }
  }

  // Get system prompt for the AI assistant
  getSystemPrompt() {
    return `You are a helpful AI assistant for a food tracking application. You help users with:
- Food item analysis and nutrition information
- Shelf life recommendations
- Recipe suggestions for expiring items
- General food-related questions
- Meal planning and food storage tips

Always provide helpful, accurate, and practical advice related to food management and nutrition in short words steps`;
  }

  // Get user context for personalized responses
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

  // Analyze food text and extract structured information
  async analyzeFoodText(text, userId) {
    try {
      const systemPrompt = `Analyze the following food text and extract structured information. Return a JSON object with:
{
  "foodItems": [
    {
      "name": "food name",
      "quantity": "quantity with unit",
      "expiryDate": "YYYY-MM-DD format",
      "category": "category like fruits, vegetables, dairy, etc.",
      "notes": "any additional notes"
    }
  ],
  "confidence": "high/medium/low"
}

Text to analyze: ${text}`;

      const userContext = await this.getUserContext(userId);
      const prompt = `${systemPrompt}\n\nUser Context: ${userContext}\n\nText to analyze: ${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      // Try to parse JSON response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AI response as JSON:', parseError);
      }

      // Fallback response
      return {
        foodItems: [],
        confidence: "low",
        rawResponse: responseText
      };
    } catch (error) {
      console.error('Error analyzing food text:', error);
      return {
        foodItems: [],
        confidence: "low",
        error: "Analysis failed"
      };
    }
  }

  // Suggest recipes for expiring food items
  async suggestRecipes(foodItems, userId) {
    try {
      const foodNames = foodItems.map(item => item.name).join(', ');
      const systemPrompt = `Suggest 3-5 simple recipes using these expiring food items: ${foodNames}. 
For each recipe, provide:
- Recipe name
- Ingredients needed (including the expiring items)
- Simple cooking instructions
- Estimated cooking time
- Difficulty level (easy/medium/hard)

Format as a JSON array of recipe objects.`;

      const userContext = await this.getUserContext(userId);
      const prompt = `${systemPrompt}\n\nUser Context: ${userContext}\n\nExpiring items: ${foodNames}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      // Try to parse JSON response
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing recipe suggestions as JSON:', parseError);
      }

      // Fallback response
      return [{
        name: "Quick Stir Fry",
        ingredients: [foodNames],
        instructions: "Heat oil in a pan, add the ingredients, stir-fry for 5-7 minutes until cooked through.",
        cookingTime: "10 minutes",
        difficulty: "easy"
      }];
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

  // Validate food item data
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

export default new AIService();