import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🍳 AI Recipe Generator
        </Link>
        <div className="navbar-links">
          <Link to="/recipes">Recipes</Link>
          <Link to="/meal-planner">Meal Planner</Link>
          <Link to="/shopping-list">Shopping List</Link>
          <Link to="/nutrition">Nutrition</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

