import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { useAuth } from '../hooks/useAuth.js';
import Skeleton from '../components/Skeleton.jsx';
import './InternalLayout.css';

/**
 * InternalLayout — wraps all authenticated internal pages.
 * Includes the collapsible Sidebar, a top header bar, and the Outlet.
 *
 * Redirects unauthenticated users to /login.
 * Shows a loading skeleton while the session is being restored.
 */
export default function InternalLayout() {
  const { isAuthenticated, authLoading, user, roleLabel } = useAuth();

  // While session is being restored (silent refresh on mount), show skeleton
  if (authLoading) {
    return (
      <div className="internal-layout__loading">
        <Skeleton variant="card" height={40} />
        <Skeleton variant="text" lines={3} />
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="internal-layout">
      <Sidebar />

      <div className="internal-layout__body">
        {/* Top header bar */}
        <header className="internal-layout__header" role="banner">
          {/* Mobile sidebar trigger — rendered by Sidebar component */}
          <div className="internal-layout__header-title" aria-hidden="true">
            {/* Breadcrumb or page title injected by child pages via context if needed */}
          </div>
          <div className="internal-layout__header-right">
            <div className="internal-layout__user-chip">
              <div className="internal-layout__avatar" aria-hidden="true">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="internal-layout__user-text">
                <span className="internal-layout__user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="internal-layout__user-role">{roleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main
          className="internal-layout__main"
          id="main-content"
          tabIndex={-1}
        >
          <div className="internal-layout__content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
