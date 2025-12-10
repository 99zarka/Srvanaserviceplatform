# Srvana Service Platform (Frontend)

A modern, responsive React frontend for the Srvana Service Platform, connecting customers with skilled service providers through an intuitive web interface. Built with cutting-edge web technologies and designed for optimal user experience across all devices.

## 🌟 Features

### Core User Experience
- **Multi-Role Interfaces**: Distinct, role-optimized dashboards for Clients, Technicians, and Admins
- **Dual Service Ordering Systems**:
  - **Direct Hire**: Streamlined booking interface for direct technician selection
  - **Bidding System**: Project posting with competitive offer management
- **Real-time Communication**: Integrated chat interface with message history
- **Interactive Dashboards**: Comprehensive project and task management interfaces
- **Public Project Discovery**: Browse and explore active service requests
- **Dispute Management Interface**: User-friendly dispute resolution workflows
- **Notification System**: Real-time notifications with toast alerts
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Advanced Features
- **Progressive Web App (PWA) Ready**: Optimized for mobile installation
- **Form Validation**: Comprehensive client-side validation with Zod schemas
- **State Management**: Redux Toolkit for predictable state updates
- **Route Protection**: Authentication-based route guards
- **Media Management**: File upload with preview functionality
- **Real-time Updates**: Live status updates and notifications
- **Error Handling**: Graceful error boundaries and user feedback
- **Loading States**: Skeleton loaders and progress indicators

### User Interface & Experience
- **Modern Design System**: Consistent UI components with Radix UI primitives
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Dark/Light Mode**: Theme switching capability (when implemented)
- **RTL Support**: Right-to-left layout support for Arabic localization
- **Interactive Charts**: Data visualization with Recharts
- **Toast Notifications**: Non-intrusive user feedback system
- **Form Optimization**: React Hook Form integration for performance

## 🏗️ Application Architecture

### Component Structure
```
Srvanaserviceplatform/src/
├── components/                    # Reusable UI components
│   ├── Header.jsx                 # Main navigation header
│   ├── Footer.jsx                 # Site footer
│   ├── HomePage.jsx               # Landing page
│   ├── AboutPage.jsx              # About information
│   ├── ServicesPage.jsx           # Service catalog
│   ├── ContactPage.jsx            # Contact information
│   ├── LoginPage.jsx              # User authentication
│   ├── SignupPage.jsx             # User registration
│   ├── TechnicianVerificationPage.jsx # Tech verification flow
│   ├── UserProfilePage.jsx        # User profile management
│   ├── BrowseUsersPage.jsx        # User directory
│   │
│   ├── dashboard/          # Client-specific components
│   │   ├── ClientDashboard.jsx    # Main client dashboard
│   │   └── ClientOrdersAndOffers.jsx # Orders and offers management
│   │
│   ├── worker-dashboard/          # Technician-specific components
│   │   ├── WorkerDashboard.jsx    # Main worker dashboard
│   │   └── WorkerTasks.jsx        # Task management
│   │
│   ├── dashboard/           # Admin-specific components
│   │   └── AdminDashboard.jsx     # Administrative interface
│   │
│   ├── service-ordering/          # Service ordering workflow
│   │   ├── OrderCreateForm.jsx    # Order creation interface
│   │   ├── EditOrderForm.jsx      # Order editing
│   │   ├── DirectHireFlow.jsx     # Direct hire workflow
│   │   ├── TechnicianBrowse.jsx   # Technician discovery
│   │   └── DirectOfferForm.jsx    # Direct offer interface
│   │
│   ├── disputes/                  # Dispute management
│   │   ├── InitiateDisputeDialog.jsx # Dispute creation
│   │   └── DisputeDetailPage.jsx  # Dispute details
│   │
│   ├── public/                    # Public-facing components
│   │   ├── PublicProjectsList.jsx # Public project browsing
│   │   └── ProjectDetail.jsx      # Public project details
│   │
│   └── NotificationDisplay.jsx    # Notification management
│
├── config/                        # Configuration files
│   └── api.js                     # API endpoints configuration
│
├── redux/                         # State management
│   ├── store.js                   # Redux store configuration
│   └── orderSlice.js              # Order state management
│
├── App.jsx                        # Main application component
└── main.jsx                       # Application entry point
```

### Page Structure & Routing

#### Public Routes
- **`/`** - HomePage: Landing page with service overview
- **`/about`** - AboutPage: Platform information and mission
- **`/services`** - ServicesPage: Service catalog and categories
- **`/contact`** - ContactPage: Contact information and forms
- **`/login`** - LoginPage: User authentication
- **`/signup`** - SignupPage: User registration
- **`/technician-verification`** - TechnicianVerificationPage: Tech verification flow

#### Service Ordering Routes
- **`/order/create`** - OrderCreateForm: Create new service orders
- **`/technicians/browse`** - TechnicianBrowse: Discover and browse technicians
- **`/offer/:technicianId`** - DirectOfferForm: Direct hire offer interface
- **`/projects`** - PublicProjectsList: Browse public service requests
- **`/projects/:order_id`** - ProjectDetail: Detailed project view

#### User-Specific Routes
- **`/profile/:userId`** - UserProfilePage: User profile management
- **`/browse-users`** - BrowseUsersPage: User directory and search
- **`/disputes/:disputeId`** - DisputeDetailPage: Dispute resolution interface
- **`/transactions/:transactionId`** - TransactionDetailPage: Financial transaction details

#### Dashboard Routes
- **`/dashboard/*`** - ClientDashboard: Client-specific interface
- **`/worker-dashboard/*`** - WorkerDashboard: Technician-specific interface
- **`/dashboard/*`** - AdminDashboard: Administrative interface

### User Flow Architecture

#### Client User Flows
1. **Service Discovery Flow**:
   - Browse services → View service details → Create order → Select hiring method

2. **Direct Hire Flow**:
   - Browse technicians → View technician profile → Send direct offer → Manage order

3. **Bidding Flow**:
   - Post service request → Receive offers → Compare offers → Select technician → Manage order

4. **Order Management Flow**:
   - View dashboard → Track order status → Communicate with technician → Release payment → Leave review

#### Technician User Flows
1. **Profile Setup Flow**:
   - Registration → Verification process → Profile completion → Service offerings

2. **Direct Hire Response Flow**:
   - Receive direct offer → Review details → Accept/decline → Communicate with client

3. **Bidding Flow**:
   - Browse projects → Submit proposals → Negotiate terms → Manage accepted orders

4. **Task Management Flow**:
   - View assigned tasks → Update status → Communicate → Mark completion → Receive payment

## 🛠️ Technology Stack

### Core Technologies
- **React 19**: Latest React with concurrent features
- **Vite**: Fast build tool and development server
- **JavaScript ES2022+**: Modern JavaScript features
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM 6**: Client-side routing

### State Management
- **Redux Toolkit**: Predictable state management
- **React-Redux**: React bindings for Redux
- **Redux Thunk**: Async action handling

### UI & Styling
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon library
- **Sonner**: Toast notification system
- **React Toastify**: Additional notification options

### Form Management
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Zod integration for React Hook Form

### Data Visualization
- **Recharts**: Composable charting library
- **React-responsive**: Media query hooks for responsive design

### Development Tools
- **Vite**: Lightning-fast HMR and build tool
- **ESLint**: Code linting and quality
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 📋 Prerequisites

- **Node.js 18+** (Latest LTS recommended)
- **npm 9+** or **yarn 1.22+** or **pnpm 8+**
- **Modern web browser** with ES2022 support
- **Backend API server** running (see backend README)

## 🚀 Installation & Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd Srvanaserviceplatform
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:

```env
# API Configuration
VITE_LOCAL_API_BASE_URL=http://127.0.0.1:8000/api
VITE_API_BASE_URL=http://your-production-api.com/api

# Application Settings
VITE_APP_NAME=Srvana Service Platform
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

# Third-party Services
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### 4. Development Server
```bash
# Start development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

### 5. Build for Production
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Deploy to static hosting
npm run deploy
```

## 🔧 Configuration

### Vite Configuration
- **Build Optimization**: Code splitting and tree shaking
- **Environment Variables**: Prefix with `VITE_` for exposure
- **Proxy Configuration**: API proxy setup for development
- **PWA Support**: Service worker and manifest configuration

### Tailwind CSS Configuration
- **Custom Design System**: Consistent spacing, colors, typography
- **RTL Support**: Right-to-left layout configuration
- **Component Classes**: Reusable utility combinations
- **Responsive Design**: Mobile-first breakpoints

### API Configuration
- **Base URL Management**: Environment-specific API endpoints
- **Authentication Headers**: Automatic JWT token handling
- **Error Handling**: Global API error management
- **Request/Response Interceptors**: Automatic data transformation

### Redux Store Configuration
- **Slice-based State**: Feature-specific state management
- **Async Thunks**: Server communication handling
- **Persistent State**: Local storage integration (when implemented)
- **Middleware**: Custom middleware for specific functionality

## 📱 User Interface

### Design System
- **Color Palette**: Professional blue and gray color scheme
- **Typography**: Inter font family with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable button, input, and card components
- **Icons**: Lucide React icon set for consistency

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-Friendly**: Appropriate touch targets and gestures
- **Navigation**: Collapsible mobile navigation

### Accessibility Features
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: WCAG AA compliant color ratios
- **Focus Management**: Clear focus indicators and management

## 🔐 Authentication & Security

### Authentication Flow
- **JWT Token Management**: Secure token storage and refresh
- **Protected Routes**: Role-based route protection
- **Session Management**: Automatic session handling
- **OAuth Integration**: Google OAuth2 support

### Security Features
- **Input Validation**: Client-side validation with Zod
- **XSS Protection**: Proper input sanitization
- **CSRF Protection**: Token-based request protection
- **Secure Headers**: Security-focused HTTP headers

## 📊 State Management

### Redux Architecture
```
store/
├── store.js          # Store configuration
├── orderSlice.js     # Order management state
└── [other slices]    # Additional feature slices
```

### State Structure
- **Authentication State**: User login status and profile
- **Order State**: Order creation, editing, and tracking
- **Notification State**: System and user notifications
- **UI State**: Loading states, modals, and theme

### Async Operations
- **API Thunks**: Server communication handling
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Comprehensive error management
- **Loading States**: User feedback during operations

## 🧪 Testing

### Testing Strategy
- **Component Testing**: React Testing Library
- **Integration Testing**: API integration testing
- **E2E Testing**: Cypress or Playwright (when configured)
- **Accessibility Testing**: Automated a11y testing

### Running Tests
```bash
# Unit tests
npm run test

# Coverage report
npm run test:coverage

# E2E tests (when configured)
npm run test:e2e
```

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Build analysis
npm run build:analyze

# Deploy to GitHub Pages
npm run deploy
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN Integration**: CloudFront, Cloudflare
- **Progressive Web App**: Service worker caching
- **Environment-specific Builds**: Development, staging, production

### Performance Optimization
- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Bundle Analysis**: Webpack bundle analyzer integration

## 🔧 Development Tools

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking (if implemented)
```

### Development Features
- **Hot Module Replacement**: Instant development feedback
- **Error Overlay**: Development error display
- **Source Maps**: Debugging support
- **API Proxy**: Backend API proxy configuration

## 📱 Progressive Web App (PWA)

### PWA Features
- **Service Worker**: Offline functionality
- **Web App Manifest**: App-like installation
- **Push Notifications**: Real-time updates (when implemented)
- **Offline Support**: Critical functionality offline

### Installation
- **Add to Home Screen**: Native app-like installation
- **Splash Screen**: Branded loading experience
- **App Icons**: Multiple icon sizes for different devices

## 🎨 Customization

### Theming
- **CSS Variables**: Dynamic theme switching capability
- **Tailwind Config**: Custom design token configuration
- **Component Variants**: Flexible component styling
- **Brand Customization**: Logo and color customization

### Component Library
- **Reusable Components**: Consistent UI component library
- **Storybook Integration**: Component documentation (when implemented)
- **Component Testing**: Automated component testing
- **Accessibility**: Built-in accessibility features

## 📈 Performance

### Optimization Techniques
- **Lazy Loading**: Route-based code splitting
- **Memoization**: React.memo and useMemo usage
- **Virtual Scrolling**: Large list optimization
- **Image Optimization**: WebP format and lazy loading

### Monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Runtime error monitoring
- **User Analytics**: User behavior tracking (when enabled)
- **Bundle Analysis**: Bundle size monitoring

## 🤝 Contributing

### Development Guidelines
1. **Component Structure**: Functional components with hooks
2. **State Management**: Redux for global state, local state for UI
3. **Styling**: Tailwind CSS utility classes
4. **Testing**: Write tests for components and features
5. **Documentation**: Update README and component docs

### Code Standards
- **ESLint Configuration**: Consistent code style
- **Prettier Integration**: Automatic code formatting
- **Git Hooks**: Pre-commit quality checks
- **Component Patterns**: Consistent component architecture

## 🆘 Troubleshooting

### Common Issues
- **Build Errors**: Check Node.js version and dependencies
- **API Connection**: Verify backend server and API URLs
- **Authentication Issues**: Check JWT token configuration
- **Routing Problems**: Verify React Router configuration

### Development Tips
- **Browser DevTools**: Use React Developer Tools
- **Redux DevTools**: Debug state management
- **Network Tab**: Monitor API requests
- **Console Logging**: Strategic debugging output

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Resources

### Documentation
- **React Documentation**: https://react.dev/
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Vite Documentation**: https://vitejs.dev/

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community support and ideas
- **Wiki**: Additional documentation and guides

---

**Built with ❤️ using React, Vite, and modern web technologies**
