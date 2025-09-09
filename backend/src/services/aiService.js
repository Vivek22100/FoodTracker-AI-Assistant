import { HfInference } from '@huggingface/inference';
import FoodItem from '../models/FoodItem.js';
import nutritionService from './nutritionService.js';
import ShelfLifeService from './shelfLifeService.js';

class AIService {
  constructor() {
    this.hf = new HfInference(process.env.HUGGING_FACE_API_KEY);
    this.chatModel = process.env.HF_CHAT_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
  }

  // Process general chat messages
  async processMessage(message, userId, context = {}) {
    try {
      const systemPrompt = this.getSystemPrompt();
      const userContext = await this.getUserContext(userId);

      const prompt = `${systemPrompt}\n\nUser Context: ${userContext}\n\nUser: ${message}`;

      const response = await this.hf.textGeneration({
        model: this.chatModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
        }
      });

      // response.decoded_text or response.generated_text depending on model backend
      const text = response.generated_text || response?.[0]?.generated_text || String(response);
      return text.replace(/^\s*Assistant:\s*/i, '').trim();
    } catch (error) {
      console.error('AI service error:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  // Analyze food text and extract food items
  async analyzeFoodText(text, userId) {
    try {
      const systemPrompt = `You are a food tracking assistant. Analyze the following text and extract food items with their details.
      
      Return a JSON array of food objects with this structure:
      [
        {
          "name": "food name",
          "category": "fruits|vegetables|dairy|meat|poultry|seafood|grains|nuts|legumes|beverages|snacks|condiments|frozen|canned|bakery|other",
          "quantity": {
            "amount": number,
            "unit": "pieces|kg|g|lbs|oz|l|ml|cups|tbsp|tsp|slices|cans|bottles|packages"
          },
          "purchaseDate": "YYYY-MM-DD" (if mentioned, otherwise use today),
          "storageLocation": "refrigerator|freezer|pantry|counter|other"
        }
      ]
      
      Only extract food items that are clearly mentioned. If no food items are found, return an empty array.`;

      const prompt = `${systemPrompt}\n\nText: ${text}\n\nReturn only valid JSON with no extra commentary.`;

      const response = await this.hf.textGeneration({
        model: this.chatModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.2,
        }
      });

      const raw = response.generated_text || response?.[0]?.generated_text || '[]';
      const jsonStart = raw.indexOf('[');
      const jsonEnd = raw.lastIndexOf(']');
      const safe = jsonStart !== -1 && jsonEnd !== -1 ? raw.slice(jsonStart, jsonEnd + 1) : '[]';
      const analysis = JSON.parse(safe);

      // Validate and process each food item
      const processedItems = [];
      for (const item of analysis) {
        if (this.validateFoodItem(item)) {
          // Get shelf life and calculate expiry date
          const shelfLifeData = await ShelfLifeService.getShelfLife(item.name, item.storageLocation);
          const purchaseDate = new Date(item.purchaseDate || new Date());
          const expiryDate = new Date(purchaseDate.getTime() + (shelfLifeData.shelfLife * 24 * 60 * 60 * 1000));

          processedItems.push({
            ...item,
            expiryDate: expiryDate.toISOString(),
            shelfLife: shelfLifeData.shelfLife
          });
        }
      }

      return {
        extractedItems: processedItems,
        originalText: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI food analysis error:', error);
      return {
        extractedItems: [],
        originalText: text,
        error: "Failed to analyze food text"
      };
    }
  }

  // Suggest recipes for expiring items
  async suggestRecipes(foodItems, userId) {
    try {
      const foodNames = foodItems.map(item => item.name).join(', ');
      
      const systemPrompt = `You are a cooking assistant. Given the following food items that are expiring soon, suggest 3-5 simple recipes that use these ingredients.
      
      For each recipe, provide:
      - Recipe name
      - Brief description
      - Main ingredients used from the list
      - Estimated cooking time
      - Difficulty level (Easy/Medium/Hard)
      
      Format as a JSON array of recipe objects.`;

      const prompt = `${systemPrompt}\n\nFood items expiring soon: ${foodNames}\n\nReturn only valid JSON with no extra commentary.`;

      const response = await this.hf.textGeneration({
        model: this.chatModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 600,
          temperature: 0.4,
        }
      });

      const raw = response.generated_text || response?.[0]?.generated_text || '[]';
      const jsonStart = raw.indexOf('[');
      const jsonEnd = raw.lastIndexOf(']');
      const safe = jsonStart !== -1 && jsonEnd !== -1 ? raw.slice(jsonStart, jsonEnd + 1) : '[]';
      const recipes = JSON.parse(safe);

      return {
        recipes,
        ingredients: foodNames,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI recipe suggestion error:', error);
      return {
        recipes: [],
        ingredients: foodItems.map(item => item.name).join(', '),
        error: "Failed to generate recipe suggestions"
      };
    }
  }

  // Get system prompt for the AI agent
  getSystemPrompt() {
    return `You are a helpful food tracking assistant for a Food Expiry & Nutrition Tracker app. Your role is to:

    1. Help users add food items to their tracker
    2. Answer questions about their food inventory
    3. Provide nutrition information
    4. Suggest recipes for expiring items
    5. Give advice on food storage and shelf life

    You should be friendly, helpful, and provide accurate information. When users mention food items, help them understand:
    - Proper storage methods
    - Expected shelf life
    - Nutrition benefits
    - Recipe suggestions

    Always be encouraging about healthy eating and reducing food waste.`;
  }

  // Get user context for personalized responses
  async getUserContext(userId) {
    try {
      const [expiringItems, totalItems] = await Promise.all([
        FoodItem.find({
          user: userId,
          isConsumed: false,
          expiryDate: { $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
        }).limit(5),
        FoodItem.countDocuments({ user: userId, isConsumed: false })
      ]);

      const context = {
        totalItems,
        expiringItems: expiringItems.map(item => ({
          name: item.name,
          daysUntilExpiry: Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        }))
      };

      return JSON.stringify(context);
    } catch (error) {
      console.error('Error getting user context:', error);
      return '{}';
    }
  }

  // Validate food item structure
  validateFoodItem(item) {
    const requiredFields = ['name', 'category', 'quantity'];
    const validCategories = [
      'fruits', 'vegetables', 'dairy', 'meat', 'poultry', 'seafood',
      'grains', 'nuts', 'legumes', 'beverages', 'snacks', 'condiments',
      'frozen', 'canned', 'bakery', 'other'
    ];
    const validUnits = [
      'pieces', 'kg', 'g', 'lbs', 'oz', 'l', 'ml', 'cups',
      'tbsp', 'tsp', 'slices', 'cans', 'bottles', 'packages'
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (!item[field]) return false;
    }

    // Check category
    if (!validCategories.includes(item.category)) return false;

    // Check quantity structure
    if (!item.quantity.amount || !item.quantity.unit) return false;
    if (!validUnits.includes(item.quantity.unit)) return false;
    if (typeof item.quantity.amount !== 'number' || item.quantity.amount <= 0) return false;

    return true;
  }
}

export default new AIService();
