import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AdminRoute from '../features/auth/AdminRoute'
import AdminLayout from '../layouts/AdminLayout'
import MainLayout from '../layouts/MainLayout'
import NotFoundPage from '../pages/NotFoundPage'

// client
const HomePage = lazy(() => import('../pages/HomePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const MoviePage = lazy(() => import('../pages/MoviePage'))
const FAQPage = lazy(() => import('../pages/FAQPage'))
const OffersPage = lazy(() => import('../pages/OffersPage'))
const BookingPage = lazy(() => import('../pages/BookingPage'))
const SessionsPage = lazy(() => import('../pages/SessionsPage'))
const CinemaBarPage = lazy(() => import('../pages/CinemaBarPage'))
const CareersPage = lazy(() => import('../pages/CareersPage'))
const LoyaltyPage = lazy(() => import('../pages/LoyaltyPage'))
const LoyaltyHistoryPage = lazy(() => import('../pages/LoyaltyHistoryPage'))
const AchievementsPage = lazy(() => import('../pages/AchievementsPage'))
const PublicTechnologiesPage = lazy(() => import('../pages/TechnologiesPage'))
const PublicHallsPage = lazy(() => import('../pages/HallsPage'))
const RulesPage = lazy(() => import('../pages/RulesPage'))
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'))
const OfferPage = lazy(() => import('../pages/OfferPage'))
const AgeLimitsPage = lazy(() => import('../pages/AgeLimitsPage'))

// admin
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'))
const HallsPage = lazy(() => import('../features/admin/HallsPage'))
const AdminSessionsPage = lazy(
  () => import('../features/admin/AdminSessionsPage'),
)
const UsersPage = lazy(() => import('../features/admin/UsersPage'))
const AdminMoviesPage = lazy(() => import('../features/admin/AdminMoviesPage'))
const TechnologiesPage = lazy(
  () => import('../features/admin/TechnologiesPage'),
)
const PricingsPage = lazy(() => import('../features/admin/PricingsPage'))
const GenresPage = lazy(() => import('../features/admin/GenresPage'))
const UserActivityPage = lazy(
  () => import('../features/admin/UserActivityPage'),
)
const AdminLoyaltyPage = lazy(
  () => import('../features/admin/AdminLoyaltyPage'),
)
const AdminAchievementsPage = lazy(
  () => import('../features/admin/AdminAchievementsPage'),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/auth/login',
        element: <LoginPage />,
      },
      {
        path: '/auth/register',
        element: <RegisterPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'movies/:id',
        element: <MoviePage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'faq',
        element: <FAQPage />,
      },
      {
        path: 'offers',
        element: <OffersPage />,
      },
      {
        path: 'booking/:id',
        element: <BookingPage />,
      },
      {
        path: 'sessions',
        element: <SessionsPage />,
      },
      {
        path: 'bar',
        element: <CinemaBarPage />,
      },
      {
        path: 'careers',
        element: <CareersPage />,
      },
      {
        path: 'technologies',
        element: <PublicTechnologiesPage />,
      },
      {
        path: 'halls',
        element: <PublicHallsPage />,
      },
      {
        path: 'rules',
        element: <RulesPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
      {
        path: 'offer',
        element: <OfferPage />,
      },
      {
        path: 'age-limits',
        element: <AgeLimitsPage />,
      },
      {
        path: 'account/loyalty',
        element: <LoyaltyPage />,
      },
      {
        path: 'account/loyalty/history',
        element: <LoyaltyHistoryPage />,
      },
      { path: 'profile/achievements', element: <AchievementsPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'halls',
            element: <HallsPage />,
          },
          {
            path: 'sessions',
            element: <AdminSessionsPage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          {
            path: 'loyalty',
            element: <AdminLoyaltyPage />,
          },
          {
            path: 'achievements',
            element: <AdminAchievementsPage />,
          },
          {
            path: 'movies',
            element: <AdminMoviesPage />,
          },
          {
            path: 'technologies',
            element: <TechnologiesPage />,
          },
          {
            path: 'user-activity',
            element: <UserActivityPage />,
          },
          {
            path: 'pricings',
            element: <PricingsPage />,
          },
          {
            path: 'genres',
            element: <GenresPage />,
          },
        ],
      },
    ],
  },
])
