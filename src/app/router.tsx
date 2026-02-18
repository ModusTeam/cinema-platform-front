import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import AboutPage from '../pages/AboutPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegisterPage from '../pages/RegisterPage'
import ProfilePage from '../pages/ProfilePage'
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboard from '../features/admin/AdminDashboard'
import AdminRoute from '../features/auth/AdminRoute'
import MoviePage from '../pages/MoviePage'
import FAQPage from '../pages/FAQPage'
import OffersPage from '../pages/OffersPage'
import HallsPage from '../features/admin/HallsPage'
import BookingPage from '../pages/BookingPage'
import SessionsPage from '../pages/SessionsPage'
import AdminSessionsPage from '../features/admin/AdminSessionsPage'
import UsersPage from '../features/admin/UsersPage'
import AdminMoviesPage from '../features/admin/AdminMoviesPage'
import TechnologiesPage from '../features/admin/TechnologiesPage'
import PricingsPage from '../features/admin/PricingsPage'
import GenresPage from '../features/admin/GenresPage'
import UserActivityPage from '../features/admin/UserActivityPage'
import CinemaBarPage from '../pages/CinemaBarPage'
import StaticPage from '../pages/StaticPage'
import CareersPage from '../pages/CareersPage'

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
        path: 'info/:pageId',
        element: <StaticPage />,
      },
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
