const passport = require('passport');

// Only initialize OAuth strategies if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const { Pool } = require('pg');
  const pool = global.pool || new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'recipe_generator',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;

    // Check if user exists
    let result = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      return done(null, result.rows[0]);
    }

    // Create new user
    result = await pool.query(
      'INSERT INTO users (email, name, oauth_provider) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, name, 'google']
    );

    return done(null, result.rows[0]);
  } catch (error) {
    return done(error, null);
  }
  }));
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const GitHubStrategy = require('passport-github2').Strategy;
  const { Pool } = require('pg');
  const pool = global.pool || new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'recipe_generator',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName || profile.username;

    // Check if user exists
    let result = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      return done(null, result.rows[0]);
    }

    // Create new user
    result = await pool.query(
      'INSERT INTO users (email, name, oauth_provider) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, name, 'github']
    );

    return done(null, result.rows[0]);
  } catch (error) {
    return done(error, null);
  }
  }));
}

module.exports = passport;

