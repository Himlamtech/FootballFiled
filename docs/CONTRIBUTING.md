# Contributing to Football Field Management System

Thank you for your interest in contributing to the Football Field Management System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We expect all contributors to adhere to the following principles:

- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Setting Up the Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/football-field-management.git
   cd football-field-management
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=9002
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=FootballField
   DB_USER=root
   DB_PASSWORD=Himlam04@
   JWT_SECRET=football_field_management_jwt_secret_key
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:9001
   ```

5. Initialize the database:
   ```bash
   cd backend/database
   node init-database.js
   ```

6. Start the development servers:
   ```bash
   # Start both frontend and backend
   ./app.sh
   
   # Or start them separately
   # Backend
   cd backend
   npm run dev
   
   # Frontend
   cd frontend
   npm run dev
   ```

## Development Workflow

We follow a feature branch workflow:

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. Make your changes and commit them with descriptive commit messages:
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

3. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request from your branch to the main repository

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the principle of DRY (Don't Repeat Yourself)
- Keep functions and methods small and focused
- Use meaningful variable and function names
- Add comments for complex logic, but prefer self-documenting code

### Backend (Node.js/Express)

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use async/await for asynchronous code
- Use the provided error handling utilities
- Organize code by feature/resource
- Use JSDoc comments for functions and classes

Example:

```javascript
/**
 * Get all fields
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllFields = async (req, res, next) => {
  try {
    const fields = await Field.findAll();
    res.status(200).json(fields);
  } catch (error) {
    next(new AppError('Failed to fetch fields', 500));
  }
};
```

### Frontend (React/TypeScript)

- Follow the [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- Use functional components with hooks
- Use TypeScript interfaces for props and state
- Use proper component organization
- Follow the project's component structure

Example:

```tsx
interface FieldCardProps {
  field: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  onSelect: (id: number) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, onSelect }) => {
  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <img 
          src={field.image} 
          alt={field.name} 
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{field.name}</h3>
          <p className="text-gray-600">{field.description}</p>
          <Button 
            className="mt-2" 
            onClick={() => onSelect(field.id)}
          >
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

## Pull Request Process

1. Ensure your code follows the coding standards
2. Update documentation if necessary
3. Add tests for new features
4. Make sure all tests pass
5. Create a pull request with a descriptive title and detailed description
6. Wait for code review and address any feedback

## Testing

### Backend Testing

We use Jest for backend testing:

```bash
cd backend
npm test
```

When adding new features, please add appropriate tests:

- Unit tests for utility functions
- Integration tests for API endpoints
- Test both success and error cases

### Frontend Testing

We use React Testing Library for frontend testing:

```bash
cd frontend
npm test
```

When adding new components, please add appropriate tests:

- Unit tests for utility functions
- Component tests for UI components
- Integration tests for pages

## Documentation

Please update documentation when making changes:

- Update README.md if necessary
- Update API documentation for new or modified endpoints
- Add JSDoc/TSDoc comments to functions and classes
- Update ARCHITECTURE.md for significant architectural changes

## Questions?

If you have any questions or need help, please open an issue or contact the project maintainers.

Thank you for contributing to the Football Field Management System!
