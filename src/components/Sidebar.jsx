import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Scale,
  LayoutDashboard,
  FolderOpen,
  BarChart2,
  Heart,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import './Sidebar.css';

/**
 * Sidebar — collapsible internal navigation sidebar.
 *
 * Role-aware nav items:
 *   admin   → all items
 *   judge   → Dashboard, Cases
 *   clerk   → Dashboard, Cases
 *   lawyer  → Dashboard, Cases, Pro-Bono
 *   litigant → Dashboard only
 */

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    Icon: LayoutDashboard,
    roles: ['admin', 'judge', 'clerk', 'lawyer', 'litigant'],
  },
  {
    to: '/cases',
    label: 'Cases',
    Icon: FolderOpen,
    roles: ['admin', 'judge', 'clerk', 'lawyer'],
  },
  {
    to: '/analytics',
    label: 'Analytics',
    Icon: BarChart2,
    roles: ['admin'],
  },
  {
    to: '/pro-bono',
    label: 'Pro-Bono',
    Icon: Heart,
    roles: ['admin', 'lawyer'],
  },
  {
    to: '/users',
    label: 'Users',
    Icon: Users,
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const { user, roleLabel, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef(null);
  const location = useLocation();

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Escape to close mobile
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const userRole = user?.role ?? 'litigant';

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole),
  );

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  function SidebarContent() {
    return (
      <>
        {/* Logo */}
        <div className="sidebar__logo-row">
          <div className="sidebar__logo">
            <Scale size={20} strokeWidth={2.5} aria-hidden="true" />
            {!collapsed && <span className="sidebar__logo-text">GAVEL</span>}
          </div>
        </div>

        {/* Nav items */}
        <nav className="sidebar__nav" aria-label="Internal navigation">
          {visibleItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__link--active' : ''}${collapsed ? ' sidebar__link--collapsed' : ''}`
              }
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" className="sidebar__link-icon" />
              {!collapsed && <span className="sidebar__link-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="sidebar__footer">
          <div className={`sidebar__user${collapsed ? ' sidebar__user--collapsed' : ''}`}>
            <div className="sidebar__avatar" aria-hidden="true">{initials}</div>
            {!collapsed && (
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="sidebar__user-role">{roleLabel}</span>
              </div>
            )}
          </div>

          <button
            className={`sidebar__logout${collapsed ? ' sidebar__logout--collapsed' : ''}`}
            onClick={logout}
            aria-label="Sign out"
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile trigger button (rendered by InternalLayout header) */}
      <button
        className="sidebar__mobile-trigger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        aria-controls="sidebar-drawer"
      >
        <Menu size={22} strokeWidth={2} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar__overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        id="sidebar-drawer"
        ref={drawerRef}
        className={`sidebar sidebar--mobile${mobileOpen ? ' sidebar--mobile-open' : ''}`}
        aria-label="Navigation"
      >
        <button
          className="sidebar__drawer-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`sidebar sidebar--desktop${collapsed ? ' sidebar--collapsed' : ''}`}
        aria-label="Navigation"
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          className="sidebar__collapse-btn"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronRight size={16} strokeWidth={2} />
          ) : (
            <ChevronLeft size={16} strokeWidth={2} />
          )}
        </button>
      </aside>
    </>
  );
}
