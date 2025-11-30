import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MealPlanner.css';

function MealPlanner() {
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
    if (location.state?.recipeId) {
      setShowAddModal(true);
      setSelectedMealType('dinner');
    }
  }, []);

  useEffect(() => {
    fetchMealPlans();
  }, [selectedDate]);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get('/api/recipes?limit=100');
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchMealPlans = async () => {
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const response = await axios.get('/api/meal-plans', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });
      setMealPlans(response.data.mealPlans);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (recipeId) => {
    try {
      await axios.post('/api/meal-plans', {
        recipe_id: recipeId,
        meal_date: selectedDate.toISOString().split('T')[0],
        meal_type: selectedMealType,
        servings: 4
      });
      setShowAddModal(false);
      fetchMealPlans();
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Error adding meal to plan');
    }
  };

  const handleDeleteMeal = async (mealPlanId) => {
    if (!window.confirm('Remove this meal from your plan?')) return;
    
    try {
      await axios.delete(`/api/meal-plans/${mealPlanId}`);
      fetchMealPlans();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const generateMealPlan = async () => {
    if (!window.confirm('Generate a meal plan for the current week? This will replace existing meals.')) return;
    
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      await axios.post('/api/meal-plans/generate', {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
      fetchMealPlans();
      alert('Meal plan generated successfully!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Error generating meal plan');
    }
  };

  const getMealsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mealPlans.filter(plan => plan.meal_date === dateStr);
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  if (loading) {
    return <div className="loading">Loading meal planner...</div>;
  }

  return (
    <div className="meal-planner">
      <div className="page-header">
        <h1>Meal Planner</h1>
        <button onClick={generateMealPlan} className="btn btn-primary">
          Generate Week Plan
        </button>
      </div>

      <div className="planner-content">
        <div className="calendar-section">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="meal-calendar"
          />
        </div>

        <div className="meals-section">
          <h2>Meals for {selectedDate.toLocaleDateString()}</h2>
          {mealTypes.map(mealType => {
            const meals = getMealsForDate(selectedDate).filter(m => m.meal_type === mealType);
            return (
              <div key={mealType} className="meal-type-section">
                <div className="meal-type-header">
                  <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      setSelectedMealType(mealType);
                      setShowAddModal(true);
                    }}
                  >
                    + Add
                  </button>
                </div>
                {meals.length > 0 ? (
                  <div className="meals-list">
                    {meals.map(meal => (
                      <div key={meal.id} className="meal-item">
                        <div className="meal-info">
                          <h4>{meal.recipe_title || 'Recipe'}</h4>
                          <p>{meal.servings} servings</p>
                        </div>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-meals">No meals planned</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Meal</h2>
            <div className="form-group">
              <label className="form-label">Meal Type</label>
              <select
                className="form-input"
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Recipe</label>
              <select
                className="form-input"
                id="recipe-select"
                defaultValue={location.state?.recipeId || ""}
              >
                <option value="">Select a recipe...</option>
                {recipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const select = document.getElementById('recipe-select');
                  if (select.value) {
                    handleAddMeal(select.value);
                  } else {
                    alert('Please select a recipe');
                  }
                }}
              >
                Add Recipe
              </button>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealPlanner;

