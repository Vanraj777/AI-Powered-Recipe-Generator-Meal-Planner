import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🍳 AI-Powered Culinary Assistant</div>
          <h1 className="hero-title">
            Transform Your Kitchen with
            <span className="gradient-text"> AI-Powered Recipes</span>
          </h1>
          <p className="hero-description">
            Discover personalized recipes, plan your meals intelligently, and track your nutrition
            all in one place. Let artificial intelligence be your personal chef.
          </p>
          <div className="hero-actions">
            <Link to="/recipes" className="btn btn-primary btn-large">
              Explore Recipes
            </Link>
            <Link to="/meal-planner" className="btn btn-outline btn-large">
              Plan Meals
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">🍕</div>
          <div className="floating-card card-2">🥗</div>
          <div className="floating-card card-3">🍰</div>
          <div className="floating-card card-4">🍝</div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-number">1000+</div>
          <div className="stat-label">Recipes Generated</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">AI-Powered</div>
          <div className="stat-label">Ingredient Recognition</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">Smart</div>
          <div className="stat-label">Meal Planning</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Cooking Assistant</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <h2>Everything You Need</h2>
          <p>Powerful features to revolutionize your cooking experience</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card feature-primary">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">📸</div>
            </div>
            <h3>Ingredient Recognition</h3>
            <p>Upload photos of ingredients and let AI identify them automatically. No more guessing what's in your pantry!</p>
            <div className="feature-link">Learn more →</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🤖</div>
            </div>
            <h3>AI Recipe Generation</h3>
            <p>Generate personalized recipes based on your preferences, dietary restrictions, and available ingredients.</p>
            <div className="feature-link">Try it now →</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">📅</div>
            </div>
            <h3>Smart Meal Planning</h3>
            <p>Plan your meals for the week with an interactive calendar. Never wonder "what's for dinner?" again.</p>
            <div className="feature-link">Start planning →</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🛒</div>
            </div>
            <h3>Smart Shopping Lists</h3>
            <p>Automatically generate organized shopping lists from your meal plans. Save time and money!</p>
            <div className="feature-link">Generate list →</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">📊</div>
            </div>
            <h3>Nutrition Tracking</h3>
            <p>Track your nutritional intake with detailed analytics. Meet your health and fitness goals effortlessly.</p>
            <div className="feature-link">View tracker →</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">⚡</div>
            </div>
            <h3>Real-Time Assistance</h3>
            <p>Get live cooking tips, ingredient substitutions, and step-by-step guidance as you cook.</p>
            <div className="feature-link">Get help →</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Cooking?</h2>
          <p>Start creating amazing meals with AI assistance today</p>
          <Link to="/recipes" className="btn btn-primary btn-large">
            Start Cooking Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;

