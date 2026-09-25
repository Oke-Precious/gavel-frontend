import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastContainer } from './components/Toast.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import InternalLayout from './layouts/InternalLayout.jsx';
import Skeleton from './components/Skeleton.jsx';
import RequireRole from './components/RequireRole.jsx';
import './App.css';

/* ------------------------------------------------------------------ */
/* Lazy page imports — each route loads its own bundle chunk           */
/* ------------------------------------------------------------------ */

// Public pages
const StyleGuidePage     = lazy(() => import('./pages/StyleGuide/StyleGuidePage.jsx'));
const PublicLookupPage   = lazy(() => import('./pages/PublicLookup/PublicLookupPage.jsx'));
const CaseNotFoundPage   = lazy(() => import('./pages/CaseNotFound/CaseNotFoundPage.jsx'));
const LandingPage        = lazy(() => import('./pages/Landing/LandingPage.jsx'));
const AboutPage          = lazy(() => import('./pages/About/AboutPage.jsx'));
const FaqPage            = lazy(() => import('./pages/Faq/FaqPage.jsx'));
const PrivacyPage        = lazy(() => import('./pages/Privacy/PrivacyPage.jsx'));
const TermsPage          = lazy(() => import('./pages/Terms/TermsPage.jsx'));
const ContactPage        = lazy(() => import('./pages/Contact/ContactPage.jsx'));
const CasePublicPage     = lazy(() => import('./pages/CasePublic/CasePublicPage.jsx'));
const WatchConfirmationPage = lazy(() => import('./pages/WatchConfirmation/WatchConfirmationPage.jsx'));
const ScorecardPage      = lazy(() => import('./pages/Scorecard/ScorecardPage.jsx'));
const BacklogMapPage     = lazy(() => import('./pages/BacklogMap/BacklogMapPage.jsx'));
const LoginPage          = lazy(() => import('./pages/Login/LoginPage.jsx'));
const RegisterPage       = lazy(() => import('./pages/Register/RegisterPage.jsx'));
const EmailVerifiedPage  = lazy(() => import('./pages/EmailVerified/EmailVerifiedPage.jsx'));
const VerifyEmailPage    = lazy(() => import('./pages/VerifyEmail/VerifyEmailPage.jsx'));
const OtpVerificationPage = lazy(() => import('./pages/OtpVerification/OtpVerificationPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword/ForgotPasswordPage.jsx'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPassword/ResetPasswordPage.jsx'));

// Internal pages (authenticated)
const RoleDashboardPage = lazy(() => import('./pages/RoleDashboard/RoleDashboardPage.jsx'));
const RecordsDashboardPage = lazy(() => import('./pages/RecordsDashboard/RecordsDashboardPage.jsx'));
const CasesPage       = lazy(() => import('./pages/Cases/CasesPage.jsx'));
const CaseDetailPage  = lazy(() => import('./pages/CaseDetail/CaseDetailPage.jsx'));
const NewCasePage     = lazy(() => import('./pages/NewCase/NewCasePage.jsx'));
const UpdateCaseStatusPage = lazy(() => import('./pages/UpdateCaseStatus/UpdateCaseStatusPage.jsx'));
const BulkImportCasesPage = lazy(() => import('./pages/BulkImportCases/BulkImportCasesPage.jsx'));
const DocumentsManagerPage = lazy(() => import('./pages/DocumentsManager/DocumentsManagerPage.jsx'));
const AnalyticsPage   = lazy(() => import('./pages/Analytics/AnalyticsPage.jsx'));
const ProBonoPage     = lazy(() => import('./pages/ProBono/ProBonoPage.jsx'));
const UsersPage       = lazy(() => import('./pages/Users/UsersPage.jsx'));
const SuperAdminPage  = lazy(() => import('./pages/SuperAdmin/SuperAdminPage.jsx'));
const ContactMessagesPage = lazy(() => import('./pages/ContactMessages/ContactMessagesPage.jsx'));
const NotificationsCenterPage = lazy(() => import('./pages/NotificationsCenter/NotificationsCenterPage.jsx'));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettings/ProfileSettingsPage.jsx'));

// 404
const NotFoundPage    = lazy(() => import('./pages/NotFound/NotFoundPage.jsx'));

/* ------------------------------------------------------------------ */
/* Suspense fallback                                                   */
/* ------------------------------------------------------------------ */
function PageLoader() {
  return (
    <div className="page-loader">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" lines={3} />
      <Skeleton variant="card" height={160} />
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
                  <Route index element={<LandingPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="lookup" element={<PublicLookupPage />} />
                  <Route path="lookup/not-found/:caseHashId?" element={<CaseNotFoundPage />} />
                  <Route path="lookup/:caseHashId/watch-confirmation" element={<WatchConfirmationPage />} />
                  <Route path="lookup/:caseHashId" element={<CasePublicPage />} />
                  <Route path="scorecard" element={<ScorecardPage />} />
                  <Route path="backlog-map" element={<BacklogMapPage />} />
                  <Route path="map" element={<BacklogMapPage />} />
                  <Route path="style-guide" element={<StyleGuidePage />} />
                </Route>

                {/* Auth pages (no layout wrapper) */}
                <Route path="login"          element={<LoginPage />} />
                <Route path="register"       element={<RegisterPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="email-verified" element={<EmailVerifiedPage />} />
                <Route path="otp-verification" element={<OtpVerificationPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="reset-password/:token" element={<ResetPasswordPage />} />

                {/* ------------------------------------------------- */}
                {/* Internal / authenticated routes                    */}
                {/* ------------------------------------------------- */}
                <Route element={<InternalLayout />}>
                  <Route path="dashboard" element={<RoleDashboardPage />} />
                  <Route
                    path="super-admin"
                    element={<RequireRole roles={['super_admin']}><SuperAdminPage /></RequireRole>}
                  />
                  <Route
                    path="records-dashboard"
                    element={<RequireRole roles={['super_admin', 'admin', 'clerk']}><RecordsDashboardPage /></RequireRole>}
                  />
                  <Route
                    path="cases"
                    element={<RequireRole roles={['super_admin', 'admin', 'judge', 'clerk', 'lawyer']}><CasesPage /></RequireRole>}
                  />
                  <Route
                    path="cases/new"
                    element={<RequireRole roles={['super_admin', 'admin', 'clerk']}><NewCasePage /></RequireRole>}
                  />
                  <Route
                    path="cases/bulk-import"
                    element={<RequireRole roles={['super_admin', 'admin', 'clerk']}><BulkImportCasesPage /></RequireRole>}
                  />
                  <Route
                    path="cases/:id/update-status"
                    element={<RequireRole roles={['super_admin', 'admin', 'judge', 'clerk']}><UpdateCaseStatusPage /></RequireRole>}
                  />
                  <Route
                    path="cases/:id/documents"
                    element={<RequireRole roles={['super_admin', 'admin', 'clerk', 'lawyer']}><DocumentsManagerPage /></RequireRole>}
                  />
                  <Route
                    path="cases/:id"
                    element={<RequireRole roles={['super_admin', 'admin', 'judge', 'clerk', 'lawyer']}><CaseDetailPage /></RequireRole>}
                  />
                  <Route
                    path="analytics"
                    element={<RequireRole roles={['super_admin', 'admin']}><AnalyticsPage /></RequireRole>}
                  />
                  <Route
                    path="pro-bono"
                    element={<RequireRole roles={['lawyer']}><ProBonoPage /></RequireRole>}
                  />
                  <Route
                    path="users"
                    element={<RequireRole roles={['super_admin', 'admin']}><UsersPage /></RequireRole>}
                  />
                  <Route
                    path="contact-messages"
                    element={<RequireRole roles={['super_admin', 'admin']}><ContactMessagesPage /></RequireRole>}
                  />
                  <Route
                    path="notifications"
                    element={<RequireRole roles={['super_admin', 'admin', 'judge', 'clerk', 'lawyer']}><NotificationsCenterPage /></RequireRole>}
                  />
                  <Route
                    path="profile-settings"
                    element={<RequireRole roles={['super_admin', 'admin', 'judge', 'clerk', 'lawyer', 'litigant']}><ProfileSettingsPage /></RequireRole>}
                  />
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
