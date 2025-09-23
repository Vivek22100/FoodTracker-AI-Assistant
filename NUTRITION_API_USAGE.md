# Nutritionix API Usage Guide

## How to Use the Nutritionix API in Your FoodTracker App

### 1. **Backend API Endpoints**

Your backend already has these nutrition endpoints configured:

#### Search for Food Items
```bash
POST /api/nutrition/search
Headers:
  Content-Type: application/json
  Authorization: Bearer <your-jwt-token>

Body:
{
  "query": "apple"
}
```

#### Get Nutrition Data
```bash
POST /api/nutrition/data
Headers:
  Content-Type: application/json
  Authorization: Bearer <your-jwt-token>

Body:
{
  "foodName": "apple",
  "quantity": 1,
  "unit": "piece"
}
```

### 2. **Frontend Integration**

I've added a new nutrition API service and enhanced the AddFood form with nutrition lookup functionality.

#### New Features Added:
- **Nutrition Lookup Button**: Click "🔍 Nutrition" next to the food name input
- **Real-time Nutrition Data**: Get accurate nutrition information from Nutritionix
- **Nutrition Display**: Shows calories, protein, fat, carbs, fiber, and sugar
- **Fallback System**: If API fails, the app still works with estimated data

### 3. **How to Use**

1. **Start your backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start your frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Add a food item**:
   - Go to the "Add Food" page
   - Enter a food name (e.g., "apple", "2 cups of rice", "chicken breast")
   - Click the "🔍 Nutrition" button
   - View the nutrition information
   - Complete the form and submit

### 4. **API Features**

#### Natural Language Processing
You can use natural language queries like:
- "2 cups of rice"
- "1 medium apple"
- "100g chicken breast"
- "1 slice of bread"

#### Comprehensive Nutrition Data
The API returns:
- **Macronutrients**: Calories, protein, fat, carbohydrates
- **Fiber and Sugar**: Dietary fiber and sugar content
- **Vitamins**: A, C, D, E, K, B-complex vitamins
- **Minerals**: Calcium, iron, magnesium, potassium, etc.

### 5. **Error Handling**

- If the API is unavailable, the app falls back to estimated nutrition data
- If a food item isn't found, it uses basic nutrition estimates
- All errors are handled gracefully without breaking the user experience

### 6. **Testing Your Setup**

To test if your API is working:

1. **Check your .env file** in the backend directory:
   ```env
   NUTRITIONIX_APP_ID=your_actual_app_id
   NUTRITIONIX_API_KEY=your_actual_api_key
   ```

2. **Test the API directly**:
   ```bash
   curl -X POST http://localhost:5000/api/nutrition/search \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"query": "apple"}'
   ```

### 7. **API Limits**

- **Free Tier**: 1,000 requests per month
- **Rate Limits**: 100 requests per hour
- **Data Coverage**: Over 500,000 food items

### 8. **Troubleshooting**

- **API not working**: Check your .env file and restart the backend
- **No nutrition data**: The app will use estimated data as fallback
- **Authentication errors**: Make sure you're logged in and have a valid JWT token

## Next Steps

You can now:
1. Add food items with accurate nutrition data
2. View nutrition information in your food cards
3. Track your nutritional intake
4. Use natural language queries for easy data entry

The nutrition data will be automatically saved with each food item and displayed in your dashboard!



