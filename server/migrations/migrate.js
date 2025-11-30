const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'recipe_generator',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Database migration completed successfully!');
    
    // Insert some sample recipes
    await insertSampleData();
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

async function insertSampleData() {
  try {
    // Check if sample data already exists
    const check = await pool.query('SELECT COUNT(*) FROM recipes');
    if (parseInt(check.rows[0].count) > 0) {
      console.log('Sample data already exists, skipping...');
      return;
    }

    // Sample recipe
    const recipeResult = await pool.query(
      `INSERT INTO recipes (title, description, cuisine, difficulty, prep_time, cook_time, servings, dietary_tags, nutrition_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        'Classic Margherita Pizza',
        'A traditional Italian pizza with fresh tomatoes, mozzarella, and basil',
        'Italian',
        'medium',
        20,
        15,
        4,
        JSON.stringify(['vegetarian', 'italian']),
        JSON.stringify({ calories: 250, protein: 12, carbs: 30, fat: 10 })
      ]
    );

    const recipeId = recipeResult.rows[0].id;

    // Sample ingredients
    await pool.query(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
       VALUES ($1, $2, $3, $4), ($1, $5, $6, $7), ($1, $8, $9, $10), ($1, $11, $12, $13)`,
      [recipeId, 'pizza dough', 1, 'package', 'tomato sauce', 1, 'cup', 'mozzarella cheese', 2, 'cups', 'fresh basil', 10, 'leaves']
    );

    // Sample instructions
    await pool.query(
      `INSERT INTO recipe_instructions (recipe_id, step_number, instruction)
       VALUES ($1, 1, $2), ($1, 2, $3), ($1, 4, $4)`,
      [
        recipeId,
        'Preheat oven to 475°F (245°C)',
        'Roll out pizza dough on a floured surface',
        'Spread tomato sauce, add cheese, and bake for 12-15 minutes'
      ]
    );

    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

migrate();

