import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastContainer } from './components/Toast.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import InternalLayout from './layouts/InternalLayout.jsx';
import Skeleton from './components/Skeleton.jsx';
import './App.css';

/* ------------------------------------------------------------------ */
/* Lazy page imports — each route loads its own bundle chunk           */
/* ------------------------------------------------------------------ */

// Public pages
const StyleGuidePage     = lazy(() => import('./pages/StyleGuide/StyleGuidePage.jsx'));
const PublicLookupPage   = lazy(() => import('./pages/PublicLookup/PublicLookupPage.jsx'));
const CasePublicPage     = lazy(() => import('./pages/CasePublic/CasePublicPage.jsx'));
const ScorecardPage      = lazy(() => import('./pages/Scorecard/ScorecardPage.jsx'));
const BacklogMapPage     = lazy(() => import('./pages/BacklogMap/BacklogMapPage.jsx'));
const LoginPage          = lazy(() => import('./pages/Login/LoginPage.jsx'));
const RegisterPage       = lazy(() => import('./pages/Register/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword/ForgotPasswordPage.jsx'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPassword/ResetPasswordPage.jsx'));

// Internal pages (authenticated)
const DashboardPage   = lazy(() => import('./pages/Dashboard/DashboardPage.jsx'));
const CasesPage       = lazy(() => import('./pages/Cases/CasesPage.jsx'));
const CaseDetailPage  = lazy(() => import('./pages/CaseDetail/CaseDetailPage.jsx'));
const NewCasePage     = lazy(() => import('./pages/NewCase/NewCasePage.jsx'));
const AnalyticsPage   = lazy(() => import('./pages/Analytics/AnalyticsPage.jsx'));
const ProBonoPage     = lazy(() => import('./pages/ProBono/ProBonoPage.jsx'));
const UsersPage       = lazy(() => import('./pages/Users/UsersPage.jsx'));

// 404
const NotFoundPage    = lazy(() => import('./pages/NotFound/NotFoundPage.jsx'));

/* ------------------------------------------------------------------ */
/* Suspense fallback                                                   */
/* ------------------------------------------------------------------ */
function PageLoader() {
  return (
    <div style={{
      padding: '4rem 2rem',
      maxWidth: 640,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" lines={3} />
      <Skeleton variant="card" height={160} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Placeholder — for pages not yet built                               */
/* ------------------------------------------------------------------ */
function Placeholder({ title }) {
  return (
    <div style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      color: '#64748B',
    }}>
      <h1 style={{ color: '#0F172A', marginBottom: '0.5rem' }}>{title}</h1>
      <p>This page is coming soon.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ToastContainer />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ------------------------------------------------- */}
                {/* Public routes                                       */}
                {/* ------------------------------------------------- */}
                <Route element={<PublicLayout />}>
                  <Route index element={<PublicLookupPage />} />
                  <Route path="lookup/:caseHashId" element={<CasePublicPage />} />
                  <Route path="scorecard" element={<ScorecardPage />} />
                  <Route path="backlog-map" element={<BacklogMapPage />} />
                  <Route path="map" element={<BacklogMapPage />} />
                  <Route path="style-guide" element={<StyleGuidePage />} />
                </Route>

                {/* Auth pages (no layout wrapper) */}
                <Route path="login"          element={<LoginPage />} />
                <Route path="register"       element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password/:token" element={<ResetPasswordPage />} />

                {/* ------------------------------------------------- */}
                {/* Internal / authenticated routes                    */}
                {/* ------------------------------------------------- */}
                <Route element={<InternalLayout />}>
                  <Route path="dashboard"  element={<DashboardPage />} />
                  <Route path="cases"      element={<CasesPage />} />
                  <Route path="cases/new"  element={<NewCasePage />} />
                  <Route path="cases/:id"  element={<CaseDetailPage />} />
                  <Route path="analytics"  element={<AnalyticsPage />} />
                  <Route path="pro-bono"   element={<ProBonoPage />} />
                  <Route path="users"      element={<UsersPage />} />
                </Route>

                {/* ------------------------------------------------- */}
                {/* Fallbacks                                           */}
                {/* ------------------------------------------------- */}
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*"   element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}