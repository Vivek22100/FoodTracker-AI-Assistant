import axios from 'axios';

class NutritionService {
  constructor() {
    this.nutritionixConfig = {
      appId: process.env.NUTRITIONIX_APP_ID,
      apiKey: process.env.NUTRITIONIX_API_KEY,
      baseUrl: 'https://trackapi.nutritionix.com/v2'
    };
  }

  // Get nutrition data from Nutritionix API
  async getNutritionData(foodName, quantity = 1, unit = 'g') {
    try {
      if (!this.nutritionixConfig.appId || !this.nutritionixConfig.apiKey) {
        console.warn('Nutritionix API credentials not configured');
        return this.getEstimatedNutrition(foodName, quantity, unit);
      }

      const response = await axios.post(
        `${this.nutritionixConfig.baseUrl}/natural/nutrients`,
        {
          query: `${quantity} ${unit} ${foodName}`,
          timezone: 'US/Eastern'
        },
        {
          headers: {
            'x-app-id': this.nutritionixConfig.appId,
            'x-app-key': this.nutritionixConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.foods && response.data.foods.length > 0) {
        const food = response.data.foods[0];
        return this.formatNutritionData(food);
      }

      return this.getEstimatedNutrition(foodName, quantity, unit);
    } catch (error) {
      console.error('Nutritionix API error:', error.response?.data || error.message);
      return this.getEstimatedNutrition(foodName, quantity, unit);
    }
  }

  // Format nutrition data from API response
  formatNutritionData(apiData) {
    return {
      calories: Math.round(apiData.nf_calories || 0),
      protein: Math.round((apiData.nf_protein || 0) * 10) / 10,
      fat: Math.round((apiData.nf_total_fat || 0) * 10) / 10,
      carbohydrates: Math.round((apiData.nf_total_carbohydrate || 0) * 10) / 10,
      fiber: Math.round((apiData.nf_dietary_fiber || 0) * 10) / 10,
      sugar: Math.round((apiData.nf_sugars || 0) * 10) / 10,
      sodium: Math.round(apiData.nf_sodium || 0),
      cholesterol: Math.round(apiData.nf_cholesterol || 0),
      vitamins: {
        vitaminA: Math.round(apiData.nf_vitamin_a_dv || 0),
        vitaminC: Math.round(apiData.nf_vitamin_c_dv || 0),
        vitaminD: Math.round(apiData.nf_vitamin_d_dv || 0),
        vitaminE: Math.round(apiData.nf_vitamin_e_dv || 0),
        vitaminK: Math.round(apiData.nf_vitamin_k_dv || 0),
        thiamine: Math.round(apiData.nf_thiamin_dv || 0),
        riboflavin: Math.round(apiData.nf_riboflavin_dv || 0),
        niacin: Math.round(apiData.nf_niacin_dv || 0),
        vitaminB6: Math.round(apiData.nf_vitamin_b6_dv || 0),
        folate: Math.round(apiData.nf_folate_dv || 0),
        vitaminB12: Math.round(apiData.nf_vitamin_b12_dv || 0),
        biotin: Math.round(apiData.nf_biotin_dv || 0),
        pantothenicAcid: Math.round(apiData.nf_pantothenic_acid_dv || 0)
      },
      minerals: {
        calcium: Math.round(apiData.nf_calcium_dv || 0),
        iron: Math.round(apiData.nf_iron_dv || 0),
        magnesium: Math.round(apiData.nf_magnesium_dv || 0),
        phosphorus: Math.round(apiData.nf_phosphorus_dv || 0),
        potassium: Math.round(apiData.nf_potassium_dv || 0),
        zinc: Math.round(apiData.nf_zinc_dv || 0),
        copper: Math.round(apiData.nf_copper_dv || 0),
        manganese: Math.round(apiData.nf_manganese_dv || 0),
        selenium: Math.round(apiData.nf_selenium_dv || 0)
      }
    };
  }

  // Get estimated nutrition data when API is not available
  getEstimatedNutrition(foodName, quantity, unit) {
    const normalizedName = foodName.toLowerCase();
    
    // Basic nutrition estimates per 100g
    const nutritionEstimates = {
      // Fruits
      'apple': { calories: 52, protein: 0.3, fat: 0.2, carbohydrates: 14, fiber: 2.4, sugar: 10 },
      'banana': { calories: 89, protein: 1.1, fat: 0.3, carbohydrates: 23, fiber: 2.6, sugar: 12 },
      'orange': { calories: 47, protein: 0.9, fat: 0.1, carbohydrates: 12, fiber: 2.4, sugar: 9 },
      'strawberry': { calories: 32, protein: 0.7, fat: 0.3, carbohydrates: 8, fiber: 2, sugar: 4.9 },
      'grape': { calories: 67, protein: 0.6, fat: 0.2, carbohydrates: 17, fiber: 0.9, sugar: 16 },
      
      // Vegetables
      'carrot': { calories: 41, protein: 0.9, fat: 0.2, carbohydrates: 10, fiber: 2.8, sugar: 4.7 },
      'lettuce': { calories: 15, protein: 1.4, fat: 0.2, carbohydrates: 3, fiber: 1.3, sugar: 0.8 },
      'tomato': { calories: 18, protein: 0.9, fat: 0.2, carbohydrates: 4, fiber: 1.2, sugar: 2.6 },
      'onion': { calories: 40, protein: 1.1, fat: 0.1, carbohydrates: 9, fiber: 1.7, sugar: 4.2 },
      'potato': { calories: 77, protein: 2, fat: 0.1, carbohydrates: 17, fiber: 2.2, sugar: 0.8 },
      
      // Dairy
      'milk': { calories: 42, protein: 3.4, fat: 1, carbohydrates: 5, fiber: 0, sugar: 5 },
      'cheese': { calories: 113, protein: 7, fat: 9, carbohydrates: 1, fiber: 0, sugar: 0.1 },
      'yogurt': { calories: 59, protein: 10, fat: 0.4, carbohydrates: 3.6, fiber: 0, sugar: 3.6 },
      'butter': { calories: 717, protein: 0.9, fat: 81, carbohydrates: 0.1, fiber: 0, sugar: 0.1 },
      'eggs': { calories: 155, protein: 13, fat: 11, carbohydrates: 1.1, fiber: 0, sugar: 1.1 },
      
      // Meat
      'chicken': { calories: 165, protein: 31, fat: 3.6, carbohydrates: 0, fiber: 0, sugar: 0 },
      'beef': { calories: 250, protein: 26, fat: 15, carbohydrates: 0, fiber: 0, sugar: 0 },
      'pork': { calories: 242, protein: 27, fat: 14, carbohydrates: 0, fiber: 0, sugar: 0 },
      'fish': { calories: 206, protein: 22, fat: 12, carbohydrates: 0, fiber: 0, sugar: 0 },
      
      // Grains
      'bread': { calories: 265, protein: 9, fat: 3.2, carbohydrates: 49, fiber: 2.7, sugar: 5.7 },
      'rice': { calories: 130, protein: 2.7, fat: 0.3, carbohydrates: 28, fiber: 0.4, sugar: 0.1 },
      'pasta': { calories: 131, protein: 5, fat: 1.1, carbohydrates: 25, fiber: 1.8, sugar: 0.6 }
    };

    // Find matching food
    let nutrition = null;
    for (const [key, value] of Object.entries(nutritionEstimates)) {
      if (normalizedName.includes(key)) {
        nutrition = value;
        break;
      }
    }

    // Default nutrition if no match found
    if (!nutrition) {
      nutrition = { calories: 50, protein: 2, fat: 1, carbohydrates: 8, fiber: 1, sugar: 3 };
    }

    // Convert quantity to grams for calculation
    const quantityInGrams = this.convertToGrams(quantity, unit);
    const multiplier = quantityInGrams / 100; // Per 100g basis

    return {
      calories: Math.round(nutrition.calories * multiplier),
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      fat: Math.round(nutrition.fat * multiplier * 10) / 10,
      carbohydrates: Math.round(nutrition.carbohydrates * multiplier * 10) / 10,
      fiber: Math.round(nutrition.fiber * multiplier * 10) / 10,
      sugar: Math.round(nutrition.sugar * multiplier * 10) / 10,
      sodium: Math.round(50 * multiplier), // Estimated
      cholesterol: Math.round(10 * multiplier), // Estimated
      vitamins: {
        vitaminA: Math.round(5 * multiplier),
        vitaminC: Math.round(10 * multiplier),
        vitaminD: Math.round(2 * multiplier),
        vitaminE: Math.round(1 * multiplier),
        vitaminK: Math.round(5 * multiplier),
        thiamine: Math.round(0.1 * multiplier),
        riboflavin: Math.round(0.1 * multiplier),
        niacin: Math.round(1 * multiplier),
        vitaminB6: Math.round(0.1 * multiplier),
        folate: Math.round(10 * multiplier),
        vitaminB12: Math.round(0.5 * multiplier),
        biotin: Math.round(1 * multiplier),
        pantothenicAcid: Math.round(0.5 * multiplier)
      },
      minerals: {
        calcium: Math.round(50 * multiplier),
        iron: Math.round(1 * multiplier),
        magnesium: Math.round(20 * multiplier),
        phosphorus: Math.round(50 * multiplier),
        potassium: Math.round(200 * multiplier),
        zinc: Math.round(1 * multiplier),
        copper: Math.round(0.1 * multiplier),
        manganese: Math.round(0.5 * multiplier),
        selenium: Math.round(5 * multiplier)
      }
    };
  }

  // Convert different units to grams
  convertToGrams(quantity, unit) {
    const conversions = {
      'g': 1,
      'kg': 1000,
      'oz': 28.35,
      'lbs': 453.59,
      'ml': 1, // Assuming 1ml = 1g for most foods
      'l': 1000,
      'cups': 240, // Approximate for most foods
      'tbsp': 15,
      'tsp': 5,
      'slices': 25, // Average slice weight
      'pieces': 50, // Average piece weight
      'cans': 400, // Average can weight
      'bottles': 500, // Average bottle weight
      'packages': 200 // Average package weight
    };

    return quantity * (conversions[unit] || 100); // Default to 100g if unit not found
  }

  // Search for food items
  async searchFood(query) {
    try {
      if (!this.nutritionixConfig.appId || !this.nutritionixConfig.apiKey) {
        return this.getBasicFoodSuggestions(query);
      }

      const response = await axios.post(
        `${this.nutritionixConfig.baseUrl}/search/instant`,
        {
          query: query,
          timezone: 'US/Eastern'
        },
        {
          headers: {
            'x-app-id': this.nutritionixConfig.appId,
            'x-app-key': this.nutritionixConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.common) {
        return response.data.common.slice(0, 10).map(item => ({
          name: item.food_name,
          brand: item.brand_name || null,
          category: item.tag_name || 'other'
        }));
      }

      return this.getBasicFoodSuggestions(query);
    } catch (error) {
      console.error('Food search error:', error.response?.data || error.message);
      return this.getBasicFoodSuggestions(query);
    }
  }

  // Get basic food suggestions when API is not available
  getBasicFoodSuggestions(query) {
    const commonFoods = [
      'apple', 'banana', 'orange', 'strawberry', 'grape',
      'carrot', 'lettuce', 'tomato', 'onion', 'potato',
      'milk', 'cheese', 'yogurt', 'butter', 'eggs',
      'chicken', 'beef', 'pork', 'fish',
      'bread', 'rice', 'pasta'
    ];

    const normalizedQuery = query.toLowerCase();
    return commonFoods
      .filter(food => food.includes(normalizedQuery))
      .slice(0, 10)
      .map(food => ({
        name: food,
        brand: null,
        category: this.getCategoryFromFoodName(food)
      }));
  }

  // Get category from food name
  getCategoryFromFoodName(foodName) {
    const categories = {
      'fruits': ['apple', 'banana', 'orange', 'strawberry', 'grape'],
      'vegetables': ['carrot', 'lettuce', 'tomato', 'onion', 'potato'],
      'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'eggs'],
      'meat': ['chicken', 'beef', 'pork', 'fish']
    };

    for (const [category, foods] of Object.entries(categories)) {
      if (foods.some(food => foodName.includes(food))) {
        return category;
      }
    }

    return 'other';
  }
}

export default new NutritionService();
