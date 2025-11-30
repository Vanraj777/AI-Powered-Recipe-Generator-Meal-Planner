const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const pool = global.pool || new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'recipe_generator',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});
// Authentication removed
// const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get nutrition summary for a date range
router.get('/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const query = `
      SELECT 
        SUM((r.nutrition_info->>'calories')::numeric * mp.servings) as total_calories,
        SUM((r.nutrition_info->>'protein')::numeric * mp.servings) as total_protein,
        SUM((r.nutrition_info->>'carbs')::numeric * mp.servings) as total_carbs,
        SUM((r.nutrition_info->>'fat')::numeric * mp.servings) as total_fat
      FROM meal_plans mp
      JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.user_id = $1 AND mp.meal_date BETWEEN $2 AND $3
    `;

    const today = new Date();
    const weekStart = start_date || new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
    const weekEnd = end_date || new Date(today.setDate(today.getDate() - today.getDay() + 6)).toISOString().split('T')[0];

    const result = await pool.query(query, [req.user.id, weekStart, weekEnd]);

    // Get user nutritional goals
    const goalsResult = await pool.query(
      'SELECT nutritional_goals FROM user_preferences WHERE user_id = $1',
      [req.user.id]
    );

    const goals = goalsResult.rows[0]?.nutritional_goals || {};

    res.json({
      summary: {
        calories: parseFloat(result.rows[0].total_calories) || 0,
        protein: parseFloat(result.rows[0].total_protein) || 0,
        carbs: parseFloat(result.rows[0].total_carbs) || 0,
        fat: parseFloat(result.rows[0].total_fat) || 0
      },
      goals: {
        calories: goals.calories || 2000,
        protein: goals.protein || 50,
        carbs: goals.carbs || 300,
        fat: goals.fat || 65
      }
    });
  } catch (error) {
    console.error('Get nutrition summary error:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition summary' });
  }
});

// Analyze recipe nutrition using external API
router.post('/analyze', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }

    // Format ingredients for nutrition API
    const ingredientString = ingredients.map(ing => 
      `${ing.quantity || 1} ${ing.unit || ''} ${ing.name}`
    ).join(', ');

    // Use Edamam Nutrition API (or similar)
    if (process.env.NUTRITION_API_ID && process.env.NUTRITION_API_KEY) {
      try {
        const response = await axios.get('https://api.edamam.com/api/nutrition-data', {
          params: {
            app_id: process.env.NUTRITION_API_ID,
            app_key: process.env.NUTRITION_API_KEY,
            ingr: ingredientString
          }
        });

        res.json({
          nutrition: {
            calories: response.data.calories || 0,
            protein: response.data.totalNutrients?.PROCNT?.quantity || 0,
            carbs: response.data.totalNutrients?.CHOCDF?.quantity || 0,
            fat: response.data.totalNutrients?.FAT?.quantity || 0,
            fiber: response.data.totalNutrients?.FIBTG?.quantity || 0,
            sugar: response.data.totalNutrients?.SUGAR?.quantity || 0
          }
        });
      } catch (apiError) {
        console.error('Nutrition API error:', apiError);
        // Fallback to estimated values
        res.json({
          nutrition: {
            calories: ingredients.length * 50,
            protein: ingredients.length * 5,
            carbs: ingredients.length * 10,
            fat: ingredients.length * 2
          },
          note: 'Estimated values (API unavailable)'
        });
      }
    } else {
      // Fallback: return estimated values
      res.json({
        nutrition: {
          calories: ingredients.length * 50,
          protein: ingredients.length * 5,
          carbs: ingredients.length * 10,
          fat: ingredients.length * 2
        },
        note: 'Estimated values (Nutrition API not configured)'
      });
    }
  } catch (error) {
    console.error('Analyze nutrition error:', error);
    res.status(500).json({ error: 'Failed to analyze nutrition' });
  }
});

// Get daily nutrition breakdown
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const query = `
      SELECT 
        mp.meal_type,
        r.title,
        (r.nutrition_info->>'calories')::numeric * mp.servings as calories,
        (r.nutrition_info->>'protein')::numeric * mp.servings as protein,
        (r.nutrition_info->>'carbs')::numeric * mp.servings as carbs,
        (r.nutrition_info->>'fat')::numeric * mp.servings as fat
      FROM meal_plans mp
      JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.user_id = $1 AND mp.meal_date = $2
      ORDER BY mp.meal_type
    `;

    const result = await pool.query(query, [req.user.id, date]);

    const dailyTotal = result.rows.reduce((acc, meal) => ({
      calories: acc.calories + parseFloat(meal.calories || 0),
      protein: acc.protein + parseFloat(meal.protein || 0),
      carbs: acc.carbs + parseFloat(meal.carbs || 0),
      fat: acc.fat + parseFloat(meal.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({
      meals: result.rows,
      dailyTotal
    });
  } catch (error) {
    console.error('Get daily nutrition error:', error);
    res.status(500).json({ error: 'Failed to fetch daily nutrition' });
  }
});

module.exports = router;

