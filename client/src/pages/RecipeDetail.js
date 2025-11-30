import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecipeDetail.css';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data);
      setRating(response.data.user_rating || 0);
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (newRating) => {
    try {
      await axios.post(`/api/recipes/${id}/rate`, { rating: newRating });
      setRating(newRating);
    } catch (error) {
      console.error('Error rating recipe:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      const response = await axios.post(`/api/recipes/${id}/favorite`);
      setIsFavorite(response.data.favorited);
    } catch (error) {
      console.error('Error favoriting recipe:', error);
    }
  };

  const addToMealPlan = () => {
    navigate('/meal-planner', { state: { recipeId: id } });
  };

  if (loading) {
    return <div className="loading">Loading recipe...</div>;
  }

  if (!recipe) {
    return <div className="error">Recipe not found</div>;
  }

  return (
    <div className="recipe-detail">
      <button onClick={() => navigate('/recipes')} className="btn-back">
        ← Back to Recipes
      </button>

      <div className="recipe-header">
        <div className="recipe-title-section">
          <h1>{recipe.title}</h1>
          <div className="recipe-actions">
            <button onClick={handleFavorite} className="btn btn-secondary">
              {isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
            </button>
            <button onClick={addToMealPlan} className="btn btn-primary">
              Add to Meal Plan
            </button>
          </div>
        </div>
        <p className="recipe-description">{recipe.description}</p>
        <div className="recipe-stats">
          <span>⏱️ {recipe.prep_time + recipe.cook_time} min</span>
          <span>👥 {recipe.servings} servings</span>
          <span>⭐ {recipe.avg_rating?.toFixed(1) || 'N/A'}</span>
          <span>📊 {recipe.difficulty}</span>
        </div>
      </div>

      <div className="recipe-content">
        <div className="recipe-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.ingredients?.map((ing, idx) => (
              <li key={idx}>
                <span className="ingredient-quantity">{ing.quantity} {ing.unit}</span>
                <span className="ingredient-name">{ing.ingredient_name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-section">
          <h2>Instructions</h2>
          <ol className="instructions-list">
            {recipe.instructions?.map((inst, idx) => (
              <li key={idx}>{inst.instruction}</li>
            ))}
          </ol>
        </div>

        <div className="recipe-section">
          <h2>Nutrition Information</h2>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <span className="nutrition-label">Calories</span>
              <span className="nutrition-value">{recipe.nutrition_info?.calories || 'N/A'}</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Protein</span>
              <span className="nutrition-value">{recipe.nutrition_info?.protein || 'N/A'}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Carbs</span>
              <span className="nutrition-value">{recipe.nutrition_info?.carbs || 'N/A'}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Fat</span>
              <span className="nutrition-value">{recipe.nutrition_info?.fat || 'N/A'}g</span>
            </div>
          </div>
        </div>

        <div className="recipe-section">
          <h2>Rate this Recipe</h2>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`star ${star <= rating ? 'active' : ''}`}
                onClick={() => handleRate(star)}
              >
                ⭐
              </button>
            ))}
            <span className="rating-text">{rating > 0 ? `You rated ${rating} stars` : 'Click to rate'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;

