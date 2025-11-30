import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NutritionTracker.css';

function NutritionTracker() {
  const [summary, setSummary] = useState(null);
  const [dailyNutrition, setDailyNutrition] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchDailyNutrition();
  }, [selectedDate]);

  const fetchSummary = async () => {
    try {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));

      const response = await axios.get('/api/nutrition/summary', {
        params: {
          start_date: weekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0]
        }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching nutrition summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyNutrition = async () => {
    try {
      const response = await axios.get('/api/nutrition/daily', {
        params: { date: selectedDate }
      });
      setDailyNutrition(response.data);
    } catch (error) {
      console.error('Error fetching daily nutrition:', error);
    }
  };

  const calculatePercentage = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return <div className="loading">Loading nutrition data...</div>;
  }

  return (
    <div className="nutrition-tracker">
      <h1>Nutrition Tracker</h1>

      {summary && (
        <div className="nutrition-summary">
          <h2>Weekly Summary</h2>
          <div className="nutrition-cards">
            <div className="nutrition-card">
              <h3>Calories</h3>
              <div className="nutrition-value-large">
                {summary.summary.calories.toFixed(0)}
                <span className="nutrition-goal">/ {summary.goals.calories}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${calculatePercentage(summary.summary.calories, summary.goals.calories)}%`,
                    backgroundColor: summary.summary.calories > summary.goals.calories ? '#f44336' : '#4CAF50'
                  }}
                />
              </div>
            </div>

            <div className="nutrition-card">
              <h3>Protein</h3>
              <div className="nutrition-value-large">
                {summary.summary.protein.toFixed(1)}g
                <span className="nutrition-goal">/ {summary.goals.protein}g</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${calculatePercentage(summary.summary.protein, summary.goals.protein)}%`,
                    backgroundColor: '#2196F3'
                  }}
                />
              </div>
            </div>

            <div className="nutrition-card">
              <h3>Carbs</h3>
              <div className="nutrition-value-large">
                {summary.summary.carbs.toFixed(1)}g
                <span className="nutrition-goal">/ {summary.goals.carbs}g</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${calculatePercentage(summary.summary.carbs, summary.goals.carbs)}%`,
                    backgroundColor: '#FF9800'
                  }}
                />
              </div>
            </div>

            <div className="nutrition-card">
              <h3>Fat</h3>
              <div className="nutrition-value-large">
                {summary.summary.fat.toFixed(1)}g
                <span className="nutrition-goal">/ {summary.goals.fat}g</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${calculatePercentage(summary.summary.fat, summary.goals.fat)}%`,
                    backgroundColor: '#9C27B0'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="daily-nutrition">
        <h2>Daily Breakdown</h2>
        <div className="date-selector">
          <label>Select Date: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
          />
        </div>

        {dailyNutrition && (
          <div className="daily-meals">
            {dailyNutrition.meals.length > 0 ? (
              <>
                {dailyNutrition.meals.map((meal, idx) => (
                  <div key={idx} className="meal-nutrition">
                    <h3>{meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}: {meal.title}</h3>
                    <div className="meal-nutrition-values">
                      <span>Calories: {meal.calories?.toFixed(0) || 0}</span>
                      <span>Protein: {meal.protein?.toFixed(1) || 0}g</span>
                      <span>Carbs: {meal.carbs?.toFixed(1) || 0}g</span>
                      <span>Fat: {meal.fat?.toFixed(1) || 0}g</span>
                    </div>
                  </div>
                ))}
                <div className="daily-total">
                  <h3>Daily Total</h3>
                  <div className="daily-total-values">
                    <span>Calories: {dailyNutrition.dailyTotal.calories.toFixed(0)}</span>
                    <span>Protein: {dailyNutrition.dailyTotal.protein.toFixed(1)}g</span>
                    <span>Carbs: {dailyNutrition.dailyTotal.carbs.toFixed(1)}g</span>
                    <span>Fat: {dailyNutrition.dailyTotal.fat.toFixed(1)}g</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="no-meals">No meals planned for this date</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NutritionTracker;

