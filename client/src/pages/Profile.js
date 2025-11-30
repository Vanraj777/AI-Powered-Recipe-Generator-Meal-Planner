import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile() {
  const [preferences, setPreferences] = useState({
    dietary_preferences: [],
    allergies: [],
    dietary_restrictions: [],
    nutritional_goals: {
      calories: 2000,
      protein: 50,
      carbs: 300,
      fat: 65
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Save preferences to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (field, value) => {
    const current = preferences[field] || [];
    if (current.includes(value)) {
      setPreferences({
        ...preferences,
        [field]: current.filter(item => item !== value)
      });
    } else {
      setPreferences({
        ...preferences,
        [field]: [...current, value]
      });
    }
  };

  const handleGoalChange = (field, value) => {
    setPreferences({
      ...preferences,
      nutritional_goals: {
        ...preferences.nutritional_goals,
        [field]: parseInt(value) || 0
      }
    });
  };

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo', 'dairy-free'];
  const allergyOptions = ['peanuts', 'tree nuts', 'shellfish', 'fish', 'eggs', 'soy', 'wheat', 'dairy'];

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <h1>Profile Settings</h1>
      <div className="user-info">
        <p><strong>Welcome!</strong> Configure your dietary preferences and nutritional goals below.</p>
      </div>

      <form onSubmit={handleSave} className="preferences-form">
        <div className="form-section">
          <h2>Dietary Preferences</h2>
          <div className="checkbox-group">
            {dietaryOptions.map(option => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.dietary_preferences.includes(option)}
                  onChange={() => handleArrayChange('dietary_preferences', option)}
                />
                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Allergies</h2>
          <div className="checkbox-group">
            {allergyOptions.map(option => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.allergies.includes(option)}
                  onChange={() => handleArrayChange('allergies', option)}
                />
                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Nutritional Goals (Daily)</h2>
          <div className="nutrition-goals">
            <div className="form-group">
              <label className="form-label">Calories</label>
              <input
                type="number"
                className="form-input"
                value={preferences.nutritional_goals.calories}
                onChange={(e) => handleGoalChange('calories', e.target.value)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Protein (g)</label>
              <input
                type="number"
                className="form-input"
                value={preferences.nutritional_goals.protein}
                onChange={(e) => handleGoalChange('protein', e.target.value)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Carbs (g)</label>
              <input
                type="number"
                className="form-input"
                value={preferences.nutritional_goals.carbs}
                onChange={(e) => handleGoalChange('carbs', e.target.value)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fat (g)</label>
              <input
                type="number"
                className="form-input"
                value={preferences.nutritional_goals.fat}
                onChange={(e) => handleGoalChange('fat', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}

export default Profile;

