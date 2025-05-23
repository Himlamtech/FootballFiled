# Football Field Management System - Frontend

This is the frontend for the Football Field Management System, built with React, TypeScript, and Tailwind CSS.

## Architecture

The frontend follows a component-based architecture with a focus on reusability and maintainability:

```
frontend/
├── public/              # Static files
│   ├── favicon.ico      # Favicon
│   ├── manifest.json    # Web app manifest
│   └── robots.txt       # Robots file
├── src/                 # Source code
│   ├── components/      # Reusable components
│   │   ├── admin/       # Admin-specific components
│   │   ├── form/        # Form components
│   │   ├── payment/     # Payment components
│   │   ├── ui/          # UI components (shadcn/ui)
│   │   └── validation/  # Form validation
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.tsx  # Authentication hook
│   │   └── use-mobile.tsx # Mobile detection hook
│   ├── layouts/         # Layout components
│   │   ├── AdminLayout.tsx # Admin layout
│   │   └── UserLayout.tsx  # User layout
│   ├── lib/             # Utility libraries
│   │   ├── api.ts       # API utilities
│   │   ├── auth.ts      # Authentication utilities
│   │   └── utils.ts     # General utilities
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── user/        # User pages
│   │   └── NotFound.tsx # 404 page
│   ├── services/        # API services
│   │   └── api.service.ts # API service
│   ├── styles/          # CSS styles
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main App component
│   ├── App.css          # App styles
│   ├── index.css        # Global styles
│   └── main.tsx         # Entry point
├── components.json      # shadcn/ui configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Key Features

### User Interface

The frontend provides interfaces for:

1. **Public User Features**
   - Home page with field information
   - Field booking system
   - Opponent finding system
   - Feedback submission

2. **Admin Features**
   - Admin login
   - Dashboard with statistics
   - Field management
   - Feedback management

### Component Structure

The application uses a hierarchical component structure:

- **Layouts**: Define the overall structure of the application
  - `AdminLayout`: Layout for admin pages
  - `UserLayout`: Layout for user pages

- **Pages**: Represent different views in the application
  - Admin pages: Dashboard, FieldManagement, Feedback
  - User pages: Home, BookingField, FindOpponents

- **Components**: Reusable UI elements
  - Admin components: LoginDialog, Navigation, ProtectedRoute
  - Form components: FormComponents, HeaderComponents
  - UI components: Buttons, Cards, Dialogs, etc.

### State Management

The application uses a combination of:

- **React Query**: For server state management
- **React Context**: For global state (auth)
- **Local state**: For component-specific state

### Authentication

Authentication is handled through:

- JWT tokens stored in localStorage
- Protected routes for admin pages
- Authentication context provider

## Pages

### User Pages

1. **Home** (`/`)
   - Displays information about the football fields
   - Allows users to navigate to booking and opponent finding

2. **BookingField** (`/booking`)
   - Allows users to book football fields
   - Shows available time slots
   - Handles booking submission

3. **FindOpponents** (`/opponents`)
   - Allows users to find opponents for matches
   - Shows available opponents
   - Handles opponent registration

### Admin Pages

1. **Dashboard** (`/admin`)
   - Shows overview statistics
   - Displays recent bookings and feedback

2. **FieldManagement** (`/admin/fields`)
   - Allows admins to manage football fields
   - CRUD operations for fields

3. **Feedback** (`/admin/feedback`)
   - Shows user feedback
   - Allows admins to respond to feedback

## API Integration

The frontend communicates with the backend through a RESTful API:

- API base URL: `http://localhost:9002/api`
- Authentication: JWT tokens in Authorization header
- Error handling: Consistent error handling with user feedback

## Setup and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build:
   ```bash
   npm run preview
   ```

The development server runs on port 9001 by default.

## Technologies Used

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **React Query**: Data fetching and state management
- **React Router**: Routing
- **Axios**: HTTP client

## Best Practices

The frontend follows these best practices:

1. **Component-Based Architecture**
   - Reusable components
   - Clear separation of concerns

2. **Type Safety**
   - TypeScript for type checking
   - Interface definitions for data structures

3. **Responsive Design**
   - Mobile-first approach
   - Responsive layouts

4. **Performance Optimization**
   - Code splitting
   - Lazy loading
   - Memoization

5. **Accessibility**
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation

6. **Error Handling**
   - Consistent error messages
   - User-friendly error displays

## Browser Compatibility

The application is compatible with:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
