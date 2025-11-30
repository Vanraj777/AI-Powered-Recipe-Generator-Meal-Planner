import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import IngredientUpload from '../components/IngredientUpload';
import './Recipes.css';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    cuisine: '',
    dietary_preference: '',
    max_time: '',
    difficulty: ''
  });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    ingredients: '',
    cuisine: '',
    meal_type: 'dinner',
    servings: 4,
    cooking_time: 60
  });

  useEffect(() => {
    fetchRecipes();
  }, [search, filters]);

  const fetchRecipes = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.cuisine) params.append('cuisine', filters.cuisine);
      if (filters.dietary_preference) params.append('dietary_preference', filters.dietary_preference);
      if (filters.max_time) params.append('max_time', filters.max_time);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const response = await axios.get(`/api/recipes?${params}`);
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecipe = async (e) => {
    e.preventDefault();
    try {
      const ingredients = generateForm.ingredients.split(',').map(i => i.trim());
      const response = await axios.post('/api/recipes/generate', {
        ingredients,
        cuisine: generateForm.cuisine,
        meal_type: generateForm.meal_type,
        servings: generateForm.servings,
        cooking_time: generateForm.cooking_time
      });
      
      setShowGenerateModal(false);
      fetchRecipes();
      alert('Recipe generated successfully!');
    } catch (error) {
      alert('Error generating recipe: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading recipes...</div>;
  }

  return (
    <div className="recipes-page">
      <div className="page-header">
        <h1>Recipes</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowGenerateModal(true)}
        >
          Generate Recipe with AI
        </button>
      </div>

      <IngredientUpload 
        onIngredientsRecognized={(ingredients) => {
          alert(`Recognized ${ingredients.length} ingredients! They've been added to your inventory.`);
        }}
      />

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search recipes..."
          className="form-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          value={filters.cuisine}
          onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
        >
          <option value="">All Cuisines</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
          <option value="Asian">Asian</option>
          <option value="American">American</option>
          <option value="Mediterranean">Mediterranean</option>
        </select>
        <select
          className="form-input"
          value={filters.difficulty}
          onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="recipes-grid">
        {recipes.map(recipe => (
          <Link to={`/recipes/${recipe.id}`} key={recipe.id} className="recipe-card">
            <div className="recipe-image">
              {recipe.image_url ? (
                <img src={recipe.image_url} alt={recipe.title} />
              ) : (
                <div className="recipe-placeholder">🍳</div>
              )}
            </div>
            <div className="recipe-info">
              <h3>{recipe.title}</h3>
              <p className="recipe-description">{recipe.description}</p>
              <div className="recipe-meta">
                <span>⏱️ {recipe.prep_time + recipe.cook_time} min</span>
                <span>👥 {recipe.servings} servings</span>
                <span>⭐ {recipe.avg_rating?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="recipe-tags">
                {recipe.dietary_tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Generate Recipe with AI</h2>
            <form onSubmit={handleGenerateRecipe}>
              <div className="form-group">
                <label className="form-label">Available Ingredients (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={generateForm.ingredients}
                  onChange={(e) => setGenerateForm({...generateForm, ingredients: e.target.value})}
                  placeholder="tomato, onion, garlic, pasta"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cuisine</label>
                <input
                  type="text"
                  className="form-input"
                  value={generateForm.cuisine}
                  onChange={(e) => setGenerateForm({...generateForm, cuisine: e.target.value})}
                  placeholder="Italian, Mexican, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Meal Type</label>
                <select
                  className="form-input"
                  value={generateForm.meal_type}
                  onChange={(e) => setGenerateForm({...generateForm, meal_type: e.target.value})}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Servings</label>
                <input
                  type="number"
                  className="form-input"
                  value={generateForm.servings}
                  onChange={(e) => setGenerateForm({...generateForm, servings: parseInt(e.target.value)})}
                  min="1"
                  max="20"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Cooking Time (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={generateForm.cooking_time}
                  onChange={(e) => setGenerateForm({...generateForm, cooking_time: parseInt(e.target.value)})}
                  min="10"
                  max="300"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;

