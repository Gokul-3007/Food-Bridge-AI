import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { FoodSafetyPage } from './pages/public/FoodSafetyPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Shared Pages
import { MapPage } from './pages/MapPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { ProfilePage } from './pages/shared/ProfilePage';

// Provider Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { NewDonationPage } from './pages/provider/NewDonationPage';
import { ProviderDonationsPage } from './pages/provider/ProviderDonationsPage';
import { DonationDetailPage } from './pages/provider/DonationDetailPage';
import { ProviderMatchesPage } from './pages/provider/ProviderMatchesPage';
import { ProviderPickupsPage } from './pages/provider/ProviderPickupsPage';
import { ProviderHistoryPage } from './pages/provider/ProviderHistoryPage';

// NGO Pages
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { NgoAvailableDonationsPage } from './pages/ngo/NgoAvailableDonationsPage';
import { NgoMatchesPage } from './pages/ngo/NgoMatchesPage';
import { NgoPickupsPage } from './pages/ngo/NgoPickupsPage';
import { NgoHistoryPage } from './pages/ngo/NgoHistoryPage';
import { NgoProfilePage } from './pages/ngo/NgoProfilePage';

// Volunteer Pages
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrganizationsPage } from './pages/admin/AdminOrganizationsPage';
import { AdminDonationsPage } from './pages/admin/AdminDonationsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/food-safety" element={<FoodSafetyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/map" element={<MapPage />} />
            </Route>

            {/* Protected Dashboard Layout Routes */}
            <Route element={<DashboardLayout />}>
              {/* Shared Protected Routes */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Provider Protected Routes */}
              <Route
                path="/provider/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/donations"
                element={
                  <ProtectedRoute allowedRoles={['provider', 'admin']}>
                    <ProviderDonationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/donations/new"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <NewDonationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/donations/:id"
                element={
                  <ProtectedRoute allowedRoles={['provider', 'admin']}>
                    <DonationDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/matches"
                element={
                  <ProtectedRoute allowedRoles={['provider', 'admin']}>
                    <ProviderMatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/pickups"
                element={
                  <ProtectedRoute allowedRoles={['provider', 'admin']}>
                    <ProviderPickupsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/history"
                element={
                  <ProtectedRoute allowedRoles={['provider', 'admin']}>
                    <ProviderHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* NGO Protected Routes */}
              <Route
                path="/ngo/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ngo']}>
                    <NgoDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/available-donations"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                    <NgoAvailableDonationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/donations/:id"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                    <DonationDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/matches"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                    <NgoMatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/pickups"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                    <NgoPickupsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/history"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                    <NgoHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/profile"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                    <NgoProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Volunteer Protected Routes */}
              <Route
                path="/volunteer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/assignments"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/organizations"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminOrganizationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/donations"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDonationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAuditLogsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
