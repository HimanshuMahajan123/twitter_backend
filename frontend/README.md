# Twitter Clone Frontend

A React-based frontend for the Twitter-like social media application built with the MERN stack.

## Features

- User Authentication (Login, Register, Forgot Password, Reset Password)
- Email Verification
- Create Posts with text, images (up to 4), video, and links
- View Feed Posts from users you follow
- Like/Unlike Posts
- Follow/Unfollow Users
- Responsive Twitter-like UI design

## Tech Stack

- React 18
- React Router DOM v6
- Axios for API calls
- Tailwind CSS for styling
- Vite as build tool

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:3000):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Post.jsx
│   │   ├── PostCreate.jsx
│   │   └── Sidebar.jsx
│   ├── context/          # React Context for state management
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── services/         # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── postService.js
│   │   ├── likeService.js
│   │   └── followService.js
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api/v1)

## Notes

- The frontend uses cookie-based authentication (httpOnly cookies) with JWT tokens
- Access tokens are stored in localStorage for Authorization headers
- Token refresh is handled automatically via axios interceptors
- All API calls include credentials for cookie handling