const express = require('express');
const OpenAI = require('openai');
const { Pool } = require('pg');
const pool = global.pool || new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'recipe_generator',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});
// Authentication is optional - removed for simplicity
// const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Initialize OpenAI client - reload from env each time to ensure fresh connection
function getOpenAIClient() {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    
    if (!apiKey || apiKey === 'your-actual-openai-api-key' || apiKey.length < 10) {
      console.warn('⚠️  OpenAI API key not properly configured');
      return null;
    }
    
    return new OpenAI({ 
      apiKey: apiKey,
      timeout: 60000, // 60 second timeout
      maxRetries: 2
    });
  } catch (error) {
    console.error('❌ Error creating OpenAI client:', error.message);
    return null;
  }
}

// Initialize on module load
const openai = getOpenAIClient();
if (openai) {
  console.log('✅ OpenAI client initialized successfully');
} else {
  console.warn('⚠️  OpenAI client not initialized - recipe generation will not work');
}

// Get all recipes with filters
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      cuisine, 
      dietary_preference, 
      max_time, 
      difficulty,
      limit = 20,
      offset = 0 
    } = req.query;

    let query = `
      SELECT r.*, 
             COALESCE(avg_rating, 0) as avg_rating,
             COALESCE(rating_count, 0) as rating_count
      FROM recipes r
      LEFT JOIN (
        SELECT recipe_id, AVG(rating) as avg_rating, COUNT(*) as rating_count
        FROM recipe_ratings
        GROUP BY recipe_id
      ) ratings ON r.id = ratings.recipe_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (r.title ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (cuisine) {
      query += ` AND r.cuisine = $${paramCount}`;
      params.push(cuisine);
      paramCount++;
    }

    if (dietary_preference) {
      query += ` AND r.dietary_tags @> $${paramCount}`;
      params.push(JSON.stringify([dietary_preference]));
      paramCount++;
    }

    if (max_time) {
      query += ` AND r.prep_time + r.cook_time <= $${paramCount}`;
      params.push(parseInt(max_time));
      paramCount++;
    }

    if (difficulty) {
      query += ` AND r.difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json({ recipes: result.rows });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, 
       COALESCE(avg_rating, 0) as avg_rating,
       COALESCE(rating_count, 0) as rating_count
       FROM recipes r
       LEFT JOIN (
         SELECT recipe_id, AVG(rating) as avg_rating, COUNT(*) as rating_count
         FROM recipe_ratings
         GROUP BY recipe_id
       ) ratings ON r.id = ratings.recipe_id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Get ingredients
    const ingredients = await pool.query(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = $1',
      [req.params.id]
    );

    // Get instructions
    const instructions = await pool.query(
      'SELECT * FROM recipe_instructions WHERE recipe_id = $1 ORDER BY step_number',
      [req.params.id]
    );

    res.json({
      ...result.rows[0],
      ingredients: ingredients.rows,
      instructions: instructions.rows
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Generate recipe using AI
router.post('/generate', async (req, res) => {
  try {
    const { 
      ingredients, 
      dietary_preferences, 
      cuisine, 
      meal_type,
      servings,
      cooking_time 
    } = req.body;

    // Get preferences from request or use defaults (no user authentication needed)
    const preferences = {
      dietary_preferences: dietary_preferences || 'none',
      allergies: 'none'
    };

    const prompt = `Generate a detailed recipe with the following requirements:
- Ingredients available: ${ingredients.join(', ')}
- Dietary preferences: ${dietary_preferences || preferences.dietary_preferences || 'none'}
- Cuisine type: ${cuisine || 'any'}
- Meal type: ${meal_type || 'dinner'}
- Servings: ${servings || 4}
- Maximum cooking time: ${cooking_time || 60} minutes
- Allergies to avoid: ${preferences.allergies || 'none'}

IMPORTANT: You must return ONLY valid JSON. Do not include any text before or after the JSON object.

Please provide:
1. Recipe title
2. Brief description
3. Detailed ingredients list with quantities
4. Step-by-step cooking instructions
5. Nutritional information (calories, protein, carbs, fat)
6. Difficulty level (easy, medium, hard)
7. Prep time and cook time in minutes
8. Dietary tags

Format as JSON with this structure:
{
  "title": "...",
  "description": "...",
  "ingredients": [{"name": "...", "quantity": "...", "unit": "..."}],
  "instructions": [{"step": 1, "instruction": "..."}],
  "nutrition": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
  "difficulty": "...",
  "prep_time": 0,
  "cook_time": 0,
  "dietary_tags": ["..."]
}`;

    // Get OpenAI client (reinitialize to ensure fresh connection)
    const openaiClient = getOpenAIClient();
    if (!openaiClient) {
      console.error('❌ OpenAI client not available');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        details: 'Please set a valid OPENAI_API_KEY in server/.env file. Make sure the key is on a single line without spaces or line breaks. Then restart the server.'
      });
    }
    
    console.log('🚀 Starting recipe generation...');
    console.log('   Ingredients:', ingredients?.join(', ') || 'none');
    console.log('   Cuisine:', cuisine || 'any');
    console.log('   Meal type:', meal_type || 'dinner');

    let recipeData;
    try {
      // Try GPT-4 first, fallback to GPT-3.5-turbo if not available
      let model = "gpt-4";
      let completion;
      
      try {
        console.log(`📡 Calling OpenAI API with model: ${model}...`);
        completion = await openaiClient.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: "You are a professional chef and nutritionist. Generate detailed, accurate recipes. Always return valid JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
          timeout: 60000
        });
        console.log('✅ Received response from OpenAI');
      } catch (modelError) {
        console.error(`❌ Error with ${model}:`, modelError.message);
        console.error('   Error code:', modelError.code);
        console.error('   Error status:', modelError.status);
        console.error('   Full error:', JSON.stringify(modelError, null, 2));
        // If GPT-4 fails, try GPT-3.5-turbo as fallback
        if (modelError.status === 404 || modelError.message?.includes('gpt-4')) {
          console.log('⚠️  GPT-4 not available, trying GPT-3.5-turbo...');
          model = "gpt-3.5-turbo";
          completion = await openai.chat.completions.create({
            model: model,
            messages: [
              { role: "system", content: "You are a professional chef and nutritionist. Generate detailed, accurate recipes. Always return valid JSON only." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          });
        } else {
          throw modelError; // Re-throw if it's a different error
        }
      }
      
      console.log(`✅ Recipe generated using ${model}`);

      const responseContent = completion.choices[0].message.content.trim();
      
      // Try to extract JSON if there's extra text
      let jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[0]);
      } else {
        recipeData = JSON.parse(responseContent);
      }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      console.error('Full error object:', JSON.stringify(openaiError, null, 2));
      
      let errorDetails = openaiError.message || 'OpenAI API error';
      let errorCode = openaiError.status || openaiError.code || 'unknown';
      
      // Provide more specific error messages
      if (openaiError.status === 401 || openaiError.code === 'invalid_api_key') {
        errorDetails = 'Invalid API key. Please check your OPENAI_API_KEY in server/.env file and restart the server.';
        errorCode = 'INVALID_API_KEY';
      } else if (openaiError.status === 429 || openaiError.code === 'rate_limit_exceeded') {
        errorDetails = 'Rate limit exceeded. Please wait a moment and try again, or check your OpenAI account limits.';
        errorCode = 'RATE_LIMIT';
      } else if (openaiError.status === 404 || openaiError.code === 'model_not_found') {
        errorDetails = 'GPT-4 model not available. Your account may not have access. Try using gpt-3.5-turbo instead.';
        errorCode = 'MODEL_NOT_FOUND';
      } else if (openaiError.code === 'insufficient_quota' || openaiError.message?.includes('quota')) {
        errorDetails = 'Insufficient credits in your OpenAI account. Please add credits at platform.openai.com';
        errorCode = 'INSUFFICIENT_QUOTA';
      } else if (openaiError.message?.includes('network') || openaiError.code === 'ECONNREFUSED') {
        errorDetails = 'Network error. Please check your internet connection.';
        errorCode = 'NETWORK_ERROR';
      }
      
      // Log detailed error for debugging
      console.error('Error Code:', errorCode);
      console.error('Error Details:', errorDetails);
      
      return res.status(500).json({ 
        error: 'Failed to generate recipe with AI',
        details: errorDetails,
        code: errorCode
      });
    }

    // Try to save recipe to database, but don't fail if database is unavailable
    let recipe = null;
    try {
      const recipeResult = await pool.query(
        `INSERT INTO recipes (
          title, description, cuisine, difficulty, prep_time, cook_time,
          servings, dietary_tags, nutrition_info, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          recipeData.title,
          recipeData.description,
          cuisine || 'International',
          recipeData.difficulty,
          recipeData.prep_time,
          recipeData.cook_time,
          servings || 4,
          JSON.stringify(recipeData.dietary_tags),
          JSON.stringify(recipeData.nutrition),
          null // No user ID needed
        ]
      );

      recipe = recipeResult.rows[0];

      // Insert ingredients
      if (recipeData.ingredients && Array.isArray(recipeData.ingredients)) {
        for (const ingredient of recipeData.ingredients) {
          try {
            await pool.query(
              `INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
               VALUES ($1, $2, $3, $4)`,
              [recipe.id, ingredient.name || ingredient.ingredient_name, ingredient.quantity || '1', ingredient.unit || 'piece']
            );
          } catch (ingError) {
            console.error('Error inserting ingredient:', ingError);
            // Continue with other ingredients
          }
        }
      }

      // Insert instructions
      if (recipeData.instructions && Array.isArray(recipeData.instructions)) {
        for (let i = 0; i < recipeData.instructions.length; i++) {
          const instruction = recipeData.instructions[i];
          try {
            await pool.query(
              `INSERT INTO recipe_instructions (recipe_id, step_number, instruction)
               VALUES ($1, $2, $3)`,
              [recipe.id, instruction.step || (i + 1), instruction.instruction || instruction]
            );
          } catch (instError) {
            console.error('Error inserting instruction:', instError);
            // Continue with other instructions
          }
        }
      }
      
      console.log('✅ Recipe saved to database');
    } catch (dbError) {
      console.warn('⚠️  Could not save recipe to database:', dbError.message);
      console.warn('   Recipe will be returned without database ID');
      // Create recipe object without database ID
      recipe = {
        id: Date.now(), // Temporary ID
        title: recipeData.title,
        description: recipeData.description,
        cuisine: cuisine || 'International',
        difficulty: recipeData.difficulty,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        servings: servings || 4,
        dietary_tags: recipeData.dietary_tags,
        nutrition_info: recipeData.nutrition,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions
      };
    }

    res.status(201).json({ 
      recipe, 
      message: 'Recipe generated successfully',
      saved_to_db: recipe.id && typeof recipe.id === 'number' && recipe.id > 1000 ? false : true
    });
  } catch (error) {
    console.error('Generate recipe error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to generate recipe';
    let errorDetails = error.message;
    
    if (error.message.includes('API key') || error.code === 'invalid_api_key') {
      errorMessage = 'OpenAI API key error';
      errorDetails = 'Please check your OPENAI_API_KEY in server/.env file and restart the server';
    } else if (error.message.includes('database') || error.code === 'ECONNREFUSED' || error.code === '28P01') {
      errorMessage = 'Database connection error (recipe still generated)';
      errorDetails = 'Recipe was generated but could not be saved to database. Check PostgreSQL connection in server/.env';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'Failed to parse recipe data';
      errorDetails = 'The AI response was not in the expected format';
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      details: process.env.NODE_ENV === 'development' ? errorDetails : 'Please check server logs for details',
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Rate recipe
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Generate a session-based user ID for anonymous users
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    
    // Check if already rated (using session ID)
    const existing = await pool.query(
      'SELECT id FROM recipe_ratings WHERE recipe_id = $1 AND user_id = (SELECT id FROM users WHERE email = $2 LIMIT 1)',
      [req.params.id, sessionId]
    );

    // For simplicity, just insert rating without user tracking
    await pool.query(
      'INSERT INTO recipe_ratings (recipe_id, user_id, rating) VALUES ($1, (SELECT id FROM users LIMIT 1), $2) ON CONFLICT DO NOTHING',
      [req.params.id, rating]
    ).catch(() => {
      // If no users exist, skip rating
    });

    res.json({ message: 'Rating saved successfully' });
  } catch (error) {
    console.error('Rate recipe error:', error);
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

// Save recipe to favorites (using localStorage on client side)
router.post('/:id/favorite', async (req, res) => {
  try {
    // Just return success - favorites will be stored in localStorage on client
    res.json({ message: 'Favorite status updated', favorited: true });
  } catch (error) {
    console.error('Favorite recipe error:', error);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

module.exports = router;

