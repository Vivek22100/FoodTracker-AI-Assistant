import express from 'express';
import auth from '../middleware/auth.js';
import aiService from '../services/mockAIService.js';

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Chat with AI agent
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await aiService.processMessage(message, req.user._id, context);

    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Server error processing AI request' });
  }
});

// @route   GET /api/ai/diagnostics
// @desc    Verify Hugging Face token and model access
// @access  Private (only to logged-in users)
router.get('/diagnostics', auth, async (req, res) => {
  try {
    const diag = await aiService.diagnostics();
    const status = diag.ok ? 200 : 500;
    res.status(status).json(diag);
  } catch (error) {
    console.error('AI diagnostics error:', error);
    res.status(500).json({ message: 'Server error running AI diagnostics' });
  }
});

// @route   POST /api/ai/analyze-food
// @desc    Analyze food items from natural language
// @access  Private
router.post('/analyze-food', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const analysis = await aiService.analyzeFoodText(text, req.user._id);

    res.json({
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI food analysis error:', error);
    res.status(500).json({ message: 'Server error analyzing food text' });
  }
});

// @route   POST /api/ai/suggest-recipes
// @desc    Get recipe suggestions for expiring items
// @access  Private
router.post('/suggest-recipes', auth, async (req, res) => {
  try {
    const { foodItems } = req.body;

    if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ message: 'Food items array is required' });
    }

    const suggestions = await aiService.suggestRecipes(foodItems, req.user._id);

    res.json({
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI recipe suggestion error:', error);
    res.status(500).json({ message: 'Server error generating recipe suggestions' });
  }
});

export default router;
