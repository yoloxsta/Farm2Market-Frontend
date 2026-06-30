# Farm2Market - B2B Agriculture Marketplace

A modern React frontend for a B2B agriculture marketplace connecting farmers with buyers.

## Tech Stack

- **React 19** + **Vite** - Fast development environment
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Query (TanStack Query)** - Server state management
- **Axios** - HTTP client
- **React Hook Form** + **Zod** - Form handling and validation
- **Lucide React Icons** - Beautiful icons
- **Recharts** - Data visualization
- **Zustand** - Client state management

## Features

### Authentication
- Login / Register
- Role-based routing (Farmer / Buyer)
- Protected routes

### Farmer Dashboard
- Statistics cards (Products, Orders, Sales, Escrow)
- Recent orders management
- Harvest reminders
- Quick actions

### Product Management
- Product list with search and filters
- Add / Edit / Delete products
- Upload product images
- Update stock and MOQ

### Order Management
- Incoming orders table
- Accept / Reject orders
- Update order status
- Order details view

### Farm Management
- Farmer profile
- Harvest schedule CRUD
- Field locations

### Earnings
- Sales history
- Total income tracking
- Escrow balance
- Withdrawal requests

### Analytics
- Monthly sales chart
- Top selling products
- Revenue visualization

### Buyer Features
- Product grid with search and filters
- Filter by category, price, location
- Product details
- Order history
- Delivery tracking

### UI Components
- Responsive design
- Dark mode support
- Skeleton loading states
- Toast notifications
- Confirmation dialogs
- Empty states
- Data tables with pagination

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── shared/          # Reusable components
│   └── farmer/          # Farmer-specific components
├── layouts/             # Page layouts
│   ├── DashboardLayout  # Main dashboard layout
│   └── AuthLayout       # Authentication layout
├── pages/
│   ├── auth/            # Login, Register
│   ├── farmer/          # Farmer dashboard pages
│   └── buyer/           # Buyer dashboard pages
├── services/
│   ├── api.ts           # API service layer
│   └── mockData.ts      # Mock data for development
├── hooks/               # Custom React hooks
├── routes/              # Routing configuration
├── types/               # TypeScript types
├── lib/                 # Utility functions
└── assets/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
cd farm2market
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo Credentials (Mock Data)

The application currently runs with mock data for development.

**Farmer Account:**
- Email: `john@greenvalley.com`
- Password: `password123`

**Buyer Account:**
- Email: `mike@freshmarket.com`
- Password: `password123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Theme Configuration

The application uses a custom theme with:
- Primary: Green (#2E7D32)
- Secondary: Yellow (#F9A825)

Colors can be customized in `tailwind.config.js`.

---

## Backend Integration Guide

When you receive your Laravel backend API, follow these steps to integrate:

### Step 1: Configure Environment

Create or update the `.env` file in the project root:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# App Configuration
VITE_APP_NAME=Farm2Market
VITE_APP_ENV=development
```

For production:
```env
VITE_API_URL=https://your-domain.com/api
VITE_APP_ENV=production
```

### Step 2: Replace Mock API with Real API

Replace the contents of `src/services/api.ts` with the real API implementation. A template is provided in `src/services/api.production.ts.template` (create this file or refer to the example below).

### Step 3: Required Laravel API Endpoints

Your Laravel backend should implement these endpoints:

#### Authentication
```
POST   /api/auth/login              # Login
POST   /api/auth/register           # Register new user
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Get current user
POST   /api/auth/forgot-password    # Forgot password
POST   /api/auth/reset-password     # Reset password
```

#### Products
```
GET    /api/products                # List products (with filters)
GET    /api/products/{id}           # Get single product
POST   /api/products                # Create product
PUT    /api/products/{id}           # Update product
DELETE /api/products/{id}           # Delete product
PATCH  /api/products/{id}/stock     # Update stock
```

#### Orders
```
GET    /api/orders                  # List orders
GET    /api/orders/{id}             # Get single order
POST   /api/orders                  # Create order
PATCH  /api/orders/{id}/status      # Update order status
POST   /api/orders/{id}/cancel      # Cancel order
```

#### Farmer Endpoints
```
GET    /api/farmer/profile                    # Get farmer profile
PUT    /api/farmer/profile                    # Update profile
GET    /api/farmer/dashboard                  # Dashboard stats
GET    /api/farmer/harvest-schedules          # List harvest schedules
POST   /api/farmer/harvest-schedules          # Create schedule
PUT    /api/farmer/harvest-schedules/{id}     # Update schedule
DELETE /api/farmer/harvest-schedules/{id}     # Delete schedule
GET    /api/farmer/analytics                  # Analytics data
GET    /api/farmer/earnings                   # Earnings data
POST   /api/farmer/withdrawals                # Request withdrawal
```

#### Buyer Endpoints
```
GET    /api/buyer/profile          # Get buyer profile
PUT    /api/buyer/profile          # Update profile
GET    /api/buyer/dashboard        # Dashboard stats
GET    /api/buyer/cart             # Get cart
POST   /api/buyer/cart             # Add to cart
DELETE /api/buyer/cart/{id}        # Remove from cart
POST   /api/buyer/checkout         # Checkout
```

#### Notifications
```
GET    /api/notifications              # List notifications
PATCH  /api/notifications/{id}/read    # Mark as read
POST   /api/notifications/read-all     # Mark all as read
```

#### File Upload
```
POST   /api/upload/image       # Upload single image
POST   /api/upload/images      # Upload multiple images
```

### Step 4: API Response Format

Your Laravel API should return JSON responses in this format:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

#### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "last_page": 5
}
```

### Step 5: Laravel Configuration

#### CORS Configuration (`config/cors.php`)
```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

#### Sanctum Configuration (`.env` in Laravel)
```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false
```

#### Kernel.php (`app/Http/Kernel.php`)
Ensure `EnsureFrontendRequestsAreStateful` middleware is in the API group:
```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

### Step 6: Example Laravel Controller

```php
<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
            'message' => 'Login successful',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }
}
```

### Step 7: Switch Between Mock and Real API

#### Option A: Environment Variable
```typescript
// src/services/api.ts
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

if (USE_MOCK) {
  // Use mock implementations
} else {
  // Use real API calls
}
```

#### Option B: Separate Files
- `src/services/api.mock.ts` - Mock implementations (current)
- `src/services/api.real.ts` - Real API implementations
- `src/services/api.ts` - Exports the appropriate one

---

## Building for Production

1. Update `.env` with production API URL:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

2. Build the application:
```bash
npm run build
```

3. Deploy the `dist` folder to your web server (Nginx, Apache, Vercel, Netlify, etc.)

### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/farm2market/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Ensure `config/cors.php` is configured correctly in Laravel
2. Clear Laravel config cache: `php artisan config:clear`
3. Verify the frontend URL matches `allowed_origins`

### 401 Unauthorized
1. Check if token is being sent in headers
2. Verify token is valid in localStorage
3. Ensure Sanctum middleware is configured

### API Not Found (404)
1. Check `VITE_API_URL` in `.env`
2. Verify routes are registered in Laravel: `php artisan route:list`
3. Ensure API prefix is correct

---

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.
