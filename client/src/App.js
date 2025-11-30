import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import NutritionTracker from './pages/NutritionTracker';
import Profile from './pages/Profile';
import './App.css';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipes/:id" element={<RecipeDetail />} />
      <Route path="/meal-planner" element={<MealPlanner />} />
      <Route path="/shopping-list" element={<ShoppingList />} />
      <Route path="/nutrition" element={<NutritionTracker />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;

