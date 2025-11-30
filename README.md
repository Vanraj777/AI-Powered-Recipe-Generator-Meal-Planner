# AI-Powered Recipe Generator & Meal Planner

An intelligent culinary assistant that generates personalized recipes based on dietary preferences, available ingredients, and nutritional goals. The system uses computer vision to identify ingredients from photos and suggests complete meal plans with shopping lists.

## Features

### Core Features
- **AI Recipe Generation**: Generate personalized recipes using GPT-4 based on available ingredients and preferences
- **Ingredient Recognition**: Upload photos of ingredients and let AI identify them automatically
- **Meal Planning**: Interactive calendar-based meal planning system
- **Shopping List Generator**: Automatically generate shopping lists from meal plans
- **Nutrition Tracking**: Track calories, protein, carbs, and fat with goal tracking
- **Recipe Discovery**: Search and filter recipes by cuisine, dietary preferences, difficulty, and cooking time

### Authentication
- JWT-based authentication
- OAuth integration (Google & GitHub)
- User profiles with dietary preferences and restrictions

### AI Integration
- GPT-4 for recipe generation and adaptation
- Computer vision (GPT-4 Vision) for ingredient identification
- Nutritional analysis and meal optimization
- Personalized recommendation system

### Real-Time Features (Optional)
- WebSocket support for live cooking assistance
- Real-time ingredient substitution suggestions
- Live nutritional calculations

## Tech Stack

### Frontend
- React 18
- React Router
- Axios for API calls
- React Calendar for meal planning
- React Dropzone for image uploads
- Socket.io Client for real-time features

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- Passport.js for OAuth
- OpenAI API integration
- Sharp for image processing
- Socket.io for WebSocket support

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- OpenAI API key
- (Optional) Edamam Nutrition API credentials
- (Optional) Google OAuth credentials
- (Optional) GitHub OAuth credentials

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-recipe-generator
```

### 2. Install dependencies

```bash
npm run install-all
```

Or install separately:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Set up PostgreSQL

Create a database:
```sql
CREATE DATABASE recipe_generator;
```

### 4. Configure environment variables

Create `server/.env` file:
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=recipe_generator
DB_PASSWORD=your_password
DB_PORT=5432

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# OpenAI API Key (Required)
OPENAI_API_KEY=your-openai-api-key

# Nutrition API (Optional - Edamam)
NUTRITION_API_ID=your-nutrition-api-id
NUTRITION_API_KEY=your-nutrition-api-key

# Client URL
CLIENT_URL=http://localhost:3000

# Server Port
PORT=5000
```

### 5. Run database migrations

```bash
cd server
npm run migrate
```

### 6. Start the application

**Development mode (runs both frontend and backend):**
```bash
npm run dev
```

**Or run separately:**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Docker Deployment

### Using Docker Compose

1. Create a `.env` file in the root directory with your configuration:
```env
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
NUTRITION_API_ID=your-nutrition-api-id
NUTRITION_API_KEY=your-nutrition-api-key
CLIENT_URL=http://localhost:3000
```

2. Build and run:
```bash
docker-compose up -d
```

3. The application will be available at:
   - Frontend & API: http://localhost:5000
   - PostgreSQL: localhost:5432

4. To stop:
```bash
docker-compose down
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update user preferences
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/github` - GitHub OAuth login

### Recipe Endpoints

- `GET /api/recipes` - Get all recipes (with filters)
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes/generate` - Generate recipe with AI
- `POST /api/recipes/:id/rate` - Rate a recipe
- `POST /api/recipes/:id/favorite` - Add/remove from favorites

### Ingredient Endpoints

- `POST /api/ingredients/recognize` - Recognize ingredients from image
- `GET /api/ingredients/inventory` - Get user inventory
- `POST /api/ingredients/inventory` - Add ingredient to inventory
- `PUT /api/ingredients/inventory/:id` - Update ingredient
- `DELETE /api/ingredients/inventory/:id` - Delete ingredient
- `GET /api/ingredients/suggestions` - Get ingredient suggestions

### Meal Plan Endpoints

- `GET /api/meal-plans` - Get meal plans for date range
- `POST /api/meal-plans` - Add meal to plan
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan
- `POST /api/meal-plans/generate` - Generate meal plan with AI

### Nutrition Endpoints

- `GET /api/nutrition/summary` - Get nutrition summary
- `GET /api/nutrition/daily` - Get daily nutrition breakdown
- `POST /api/nutrition/analyze` - Analyze recipe nutrition

### Shopping List Endpoints

- `GET /api/shopping-list/generate` - Generate shopping list
- `GET /api/shopping-list` - Get saved shopping list
- `POST /api/shopping-list` - Save shopping list
- `PUT /api/shopping-list/items/:id` - Update shopping list item

## Usage Examples

### Generate a Recipe

1. Go to Recipes page
2. Click "Generate Recipe with AI"
3. Enter available ingredients (comma-separated)
4. Select cuisine, meal type, servings, and cooking time
5. Click "Generate Recipe"

### Recognize Ingredients from Photo

1. Go to Recipes page
2. Use the ingredient upload feature
3. Upload a photo of ingredients
4. AI will identify and add them to your inventory

### Plan Meals

1. Go to Meal Planner
2. Select a date on the calendar
3. Click "+ Add" for a meal type
4. Select a recipe
5. The meal will be added to your plan

### Generate Shopping List

1. Plan your meals for the week
2. Go to Shopping List page
3. Click "Regenerate" to create a list from your meal plans
4. Check off items as you shop

## Project Structure

```
ai-recipe-generator/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── migrations/        # Database migrations
│   ├── routes/           # API routes
│   ├── index.js          # Server entry point
│   └── package.json
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # Docker build file
└── README.md
```

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts
- `user_preferences` - Dietary preferences and goals
- `recipes` - Recipe information
- `recipe_ingredients` - Recipe ingredients
- `recipe_instructions` - Cooking instructions
- `meal_plans` - User meal plans
- `user_inventory` - User ingredient inventory
- `shopping_lists` - Shopping lists
- `recipe_ratings` - Recipe ratings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

## Future Enhancements

- [ ] Advanced meal planning algorithms
- [ ] Recipe scaling for different serving sizes
- [ ] Integration with grocery delivery services
- [ ] Social features (share recipes, meal plans)
- [ ] Mobile app version
- [ ] Voice-activated cooking assistance
- [ ] Recipe video integration
- [ ] Advanced nutrition tracking with micronutrients

