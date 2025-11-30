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

// Generate shopping list from meal plans
router.get('/generate', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const today = new Date();
    const weekStart = start_date || new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
    const weekEnd = end_date || new Date(today.setDate(today.getDate() - today.getDay() + 6)).toISOString().split('T')[0];

    // Get all ingredients from meal plans in date range
    const query = `
      SELECT 
        ri.ingredient_name,
        ri.unit,
        SUM(ri.quantity * mp.servings) as total_quantity
      FROM meal_plans mp
      JOIN recipes r ON mp.recipe_id = r.id
      JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      WHERE mp.user_id = $1 AND mp.meal_date BETWEEN $2 AND $3
      GROUP BY ri.ingredient_name, ri.unit
      ORDER BY ri.ingredient_name
    `;

    const result = await pool.query(query, [req.user.id, weekStart, weekEnd]);

    // Subtract items already in inventory
    const inventory = await pool.query(
      'SELECT ingredient_name, quantity, unit FROM user_inventory WHERE user_id = $1',
      [req.user.id]
    );

    const shoppingList = result.rows.map(item => {
      const inventoryItem = inventory.rows.find(
        inv => inv.ingredient_name.toLowerCase() === item.ingredient_name.toLowerCase()
      );

      if (inventoryItem) {
        const needed = parseFloat(item.total_quantity) - parseFloat(inventoryItem.quantity);
        return {
          ...item,
          total_quantity: Math.max(0, needed),
          in_inventory: parseFloat(inventoryItem.quantity),
          needed: needed > 0
        };
      }

      return {
        ...item,
        in_inventory: 0,
        needed: true
      };
    }).filter(item => item.needed);

    res.json({ shoppingList });
  } catch (error) {
    console.error('Generate shopping list error:', error);
    res.status(500).json({ error: 'Failed to generate shopping list' });
  }
});

// Get saved shopping list (stored in localStorage on client)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM shopping_lists WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ shoppingList: [] });
    }

    const items = await pool.query(
      'SELECT * FROM shopping_list_items WHERE shopping_list_id = $1 ORDER BY ingredient_name',
      [result.rows[0].id]
    );

    res.json({
      shoppingList: {
        ...result.rows[0],
        items: items.rows
      }
    });
  } catch (error) {
    console.error('Get shopping list error:', error);
    res.status(500).json({ error: 'Failed to fetch shopping list' });
  }
});

// Save shopping list (stored in localStorage on client)
router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    // Create shopping list
    const listResult = await pool.query(
      'INSERT INTO shopping_lists (user_id) VALUES ($1) RETURNING *',
      [req.user.id]
    );

    const shoppingListId = listResult.rows[0].id;

    // Insert items
    for (const item of items) {
      await pool.query(
        `INSERT INTO shopping_list_items (shopping_list_id, ingredient_name, quantity, unit, checked)
         VALUES ($1, $2, $3, $4, $5)`,
        [shoppingListId, item.ingredient_name, item.quantity, item.unit, false]
      );
    }

    res.status(201).json({ message: 'Shopping list saved successfully', id: shoppingListId });
  } catch (error) {
    console.error('Save shopping list error:', error);
    res.status(500).json({ error: 'Failed to save shopping list' });
  }
});

// Update shopping list item (check/uncheck)
router.put('/items/:id', async (req, res) => {
  try {
    const { checked } = req.body;

    const result = await pool.query(
      `UPDATE shopping_list_items 
       SET checked = $1 
       WHERE id = $2 AND shopping_list_id IN (
         SELECT id FROM shopping_lists WHERE user_id = $3
       )
       RETURNING *`,
      [checked, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shopping list item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Update shopping list item error:', error);
    res.status(500).json({ error: 'Failed to update shopping list item' });
  }
});

module.exports = router;

