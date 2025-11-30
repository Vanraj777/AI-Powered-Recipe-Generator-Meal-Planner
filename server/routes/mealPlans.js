const express = require('express');
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

// Get meal plans for a date range (using localStorage on client)
router.get('/', async (req, res) => {
  try {
    // Return empty array - meal plans stored in localStorage on client
    // This allows the frontend to work without database dependency
    res.json({ mealPlans: [] });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ error: 'Failed to fetch meal plans' });
  }
});

// Add meal to plan (stored in localStorage on client)
router.post('/', async (req, res) => {
  try {
    const { recipe_id, meal_date, meal_type, servings } = req.body;

    if (!recipe_id || !meal_date || !meal_type) {
      return res.status(400).json({ error: 'Recipe ID, meal date, and meal type are required' });
    }

    // Return success - data stored in localStorage on client
    res.status(201).json({ 
      mealPlan: {
        id: Date.now(),
        recipe_id,
        meal_date,
        meal_type,
        servings: servings || 4
      },
      message: 'Meal plan saved (stored locally)'
    });
  } catch (error) {
    console.error('Add meal plan error:', error);
    res.status(500).json({ error: 'Failed to add meal plan' });
  }
});

// Update meal plan (stored in localStorage on client)
router.put('/:id', async (req, res) => {
  try {
    const { recipe_id, meal_date, meal_type, servings } = req.body;

    // Return success - data stored in localStorage on client
    res.json({ 
      mealPlan: {
        id: req.params.id,
        recipe_id,
        meal_date,
        meal_type,
        servings
      },
      message: 'Meal plan updated (stored locally)'
    });
  } catch (error) {
    console.error('Update meal plan error:', error);
    res.status(500).json({ error: 'Failed to update meal plan' });
  }
});

// Delete meal plan (stored in localStorage on client)
router.delete('/:id', async (req, res) => {
  try {
    // Return success - deletion handled in localStorage on client
    res.json({ message: 'Meal plan deleted successfully (stored locally)' });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({ error: 'Failed to delete meal plan' });
  }
});

// Generate meal plan using AI (stored in localStorage on client)
router.post('/generate', async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    // Get some sample recipes for meal plan
    const recipeResult = await pool.query('SELECT id FROM recipes LIMIT 10');
    const recipes = recipeResult.rows;

    // Simple meal plan generation
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const mealPlans = [];
    const start = new Date(start_date);
    const end = new Date(end_date);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      for (const mealType of mealTypes) {
        if (recipes.length > 0) {
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
          mealPlans.push({
            id: Date.now() + Math.random(),
            recipe_id: randomRecipe.id,
            meal_date: d.toISOString().split('T')[0],
            meal_type: mealType,
            servings: 4
          });
        }
      }
    }

    res.json({ 
      message: 'Meal plan generated successfully (stored locally)', 
      mealPlans,
      count: mealPlans.length 
    });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({ error: 'Failed to generate meal plan' });
  }
});

module.exports = router;

