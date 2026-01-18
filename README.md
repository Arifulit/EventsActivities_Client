# Events & Activities Platform - Frontend

A comprehensive social platform for connecting people with events and activities based on shared interests. Built with Next.js 13, React 18, TypeScript, and Tailwind CSS.


## 🎬 Project Demo Video

👉 **Watch Full Screen:**  
https://drive.google.com/file/d/1sUXPzmMJPO3SNyTdxSk9SGJ1x-GZ0JB4/preview?autoplay=1


[▶️ Watch Full Screen Demo](https://drive.google.com/file/d/1sUXPzmMJPO3SNyTdxSk9SGJ1x-GZ0JB4/preview?autoplay=1)


[![Watch Demo](assets/demo.png)](https://drive.google.com/file/d/1sUXPzmMJPO3SNyTdxSk9SGJ1x-GZ0JB4/preview?autoplay=1)


## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based login/register with role management (User, Host, Admin)
- **Event Management**: Create, browse, search, and join events
- **Profile System**: User profiles with interests, ratings, and event history
- **Payment Integration**: Secure payment processing for paid events
- **Review & Rating System**: Post-event reviews and user ratings
- **Role-Based Dashboards**: Different views for users, hosts, and admins

### Key Pages & Components

#### Authentication
- **Login Page** (`/login`): Email/password authentication with social login options
- **Register Page** (`/register`): User registration with validation

#### Main Application
- **Home Page** (`/`): Landing page with 6+ sections showcasing platform features
- **Events Listing** (`/events`): Browse and search events with filters
- **Event Details** (`/events/[id]`): Detailed event view with join/leave functionality
- **Create Event** (`/events/create`): Event creation form for hosts
- **User Profile** (`/profile/[id]`): User profiles with editing capabilities
- **Dashboard** (`/dashboard`): Role-based dashboard with analytics
- **Reviews** (`/events/[id]/reviews`): Event reviews and ratings
- **Payment** (`/events/[id]/payment`): Secure payment processing
- **Payment Success** (`/events/[id]/payment/success`): Payment confirmation page

#### Navigation & UI
- **Responsive Navbar**: Role-based navigation with mobile menu
- **UI Components**: Reusable components (Button, Input, Card, etc.)
- **Toast Notifications**: User feedback system

## 🛠 Tech Stack

- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with class-variance-authority
- **Icons**: Lucide React
- **Authentication**: JWT with localStorage
- **State Management**: React Context API
- **Form Handling**: React hooks with validation
- **HTTP Client**: Axios (ready for API integration)

## 📁 Project Structure

```
app/
├── (auth)/                 # Authentication routes
│   ├── login/
│   └── register/
├── (main)/                 # Main application routes
│   ├── dashboard/
│   ├── events/
│   │   ├── [id]/
│   │   │   ├── payment/
│   │   │   └── reviews/
│   │   └── create/
│   ├── profile/
│   │   └── [id]/
│   └── page.tsx           # Home page
├── components/
│   ├── shared/             # Shared components
│   │   └── navbar.tsx
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── context/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   ├── utils.ts           # Utility functions
│   └── api.ts            # API configuration
├── types/
│   └── index.ts          # TypeScript type definitions
└── layout.tsx            # Root layout
```

## 🎯 User Roles

### User
- Browse and search events
- Join events (free and paid)
- View and edit profile
- Leave reviews and ratings
- Track event history

### Host
- All user capabilities
- Create and manage events
- View event analytics
- Manage participants
- Track revenue

### Admin
- All host capabilities
- User management
- Platform oversight
- Event moderation
- System analytics

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd activities_frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Responsive Design

- **Mobile-first approach** with Tailwind CSS
- **Responsive navigation** with mobile menu
- **Adaptive layouts** for all screen sizes
- **Touch-friendly** interface elements

## 🔐 Security Features

- **JWT Authentication** with secure token storage
- **Role-based access control** (RBAC)
- **Input validation** and sanitization
- **Secure payment processing** (UI ready for integration)
- **Protected routes** with authentication checks

## 🎨 UI/UX Features

- **Modern, clean design** with consistent styling
- **Interactive components** with hover states and transitions
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Accessibility** considerations (ARIA labels, keyboard navigation)

## 🔌 API Integration

The frontend is designed to work with a RESTful API. Mock data is currently used for demonstration. To integrate with your backend:

1. Update API endpoints in `lib/api.ts`
2. Replace mock data calls in components
3. Configure authentication headers
4. Set up error handling

## 📊 Key Features Implemented

### ✅ Authentication System
- Login/register with validation
- Password visibility toggle
- Social login buttons (UI ready)
- Remember me functionality
- Error handling and feedback

### ✅ Event Management
- Event creation with rich form
- Event listing with search/filter
- Event details with join/leave
- Category-based organization
- Participant management

### ✅ User Profiles
- Profile viewing and editing
- Interest tags management
- Event history display
- Rating system
- Profile images (UI ready)

### ✅ Payment System
- Secure payment form
- Card validation
- Processing fee calculation
- Payment confirmation
- Ticket download

### ✅ Review System
- Star ratings
- Written reviews
- Helpful/not helpful voting
- Review statistics
- User review history

### ✅ Dashboard
- Role-based views
- Analytics and statistics
- Quick actions
- Recent activity
- Performance metrics

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
```
Deploy to Vercel for automatic Next.js optimization.

### Other Platforms
Ensure the platform supports Next.js 13 with App Router.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ using Next.js 13, React 18, TypeScript, and Tailwind CSS**
