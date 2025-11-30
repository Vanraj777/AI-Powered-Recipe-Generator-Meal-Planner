const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const OpenAI = require('openai');
const { Pool } = require('pg');
const pool = global.pool || new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'recipe_generator',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});
// Authentication removed - routes are now public
// const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Recognize ingredients from image
router.post('/recognize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Resize and optimize image
    const processedImage = await sharp(req.file.buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Convert to base64 for OpenAI Vision API
    const base64Image = processedImage.toString('base64');

    // Use OpenAI Vision API to identify ingredients
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify all the food ingredients visible in this image. List them as a JSON array of objects with 'name' and 'confidence' fields. Only include items you can clearly identify as food ingredients. Example: [{\"name\": \"tomato\", \"confidence\": 0.9}, {\"name\": \"onion\", \"confidence\": 0.85}]"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content;
    let ingredients = [];

    try {
      // Try to parse JSON from response
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        ingredients = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: extract ingredient names from text
        const lines = responseText.split('\n');
        ingredients = lines
          .filter(line => line.trim() && !line.includes('{') && !line.includes('['))
          .map(line => ({
            name: line.replace(/[-\d\.]/g, '').trim().toLowerCase(),
            confidence: 0.7
          }))
          .filter(item => item.name.length > 2);
      }
    } catch (parseError) {
      console.error('Error parsing ingredients:', parseError);
      return res.status(500).json({ error: 'Failed to parse ingredient recognition results' });
    }

      // Ingredients recognized - return to client (no database save needed)

    res.json({
      ingredients,
      message: `Recognized ${ingredients.length} ingredients`
    });
  } catch (error) {
    console.error('Ingredient recognition error:', error);
    res.status(500).json({ error: 'Failed to recognize ingredients', details: error.message });
  }
});

// Get ingredient suggestions based on partial name
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const result = await pool.query(
      `SELECT DISTINCT ingredient_name 
       FROM recipe_ingredients 
       WHERE ingredient_name ILIKE $1 
       LIMIT 10`,
      [`%${q}%`]
    );

    res.json({ suggestions: result.rows.map(r => r.ingredient_name) });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;

