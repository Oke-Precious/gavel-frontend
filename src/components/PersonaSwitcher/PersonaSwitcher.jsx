import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, UserCheck, Shield, BookOpen, Scale, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import './PersonaSwitcher.css';

const PERSONAS = [
  {
    key: 'public',
    name: 'Public Observer',
    subtitle: 'Citizen, journalist, or relative auditing remand timelines without personal data leakage',
    badge: 'Guest / Family',
    icon: Eye,
    destination: '/',
  },
  {
    key: 'legal_aid',
    name: 'Legal Aid Officer (Amaka)',
    subtitle: 'Lagos Legal Aid Council — manage assigned caseload, file bail apps, claim unrepresented detainees',
    badge: 'Legal Aid',
    icon: Scale,
    destination: '/pro-bono',
  },
  {
    key: 'records_officer',
    name: 'Records Officer (Ibrahim)',
    subtitle: 'Kirikiri Custodial Centre — update custody duration, track physical docket files, log escorts',
    badge: 'Corrections',
    icon: BookOpen,
    destination: '/records-dashboard',
  },
  {
    key: 'admin',
    name: 'Oversight Admin (Chinedu)',
    subtitle: 'National Judicial Council / MoJ — bottleneck analytics, judicial scorecard, institutional audit log',
    badge: 'Ministry / NJC',
    icon: Shield,
    destination: '/admin/overview',
  },
];

export default function PersonaSwitcher({ compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const menuRef = useRef(null);
  const { user, isAuthenticated, switchPersona } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current active persona key
  const activeKey = !isAuthenticated
    ? 'public'
    : user?.role === 'lawyer' || user?.role === 'judge'
    ? 'legal_aid'
    : user?.role === 'clerk'
    ? 'records_officer'
    : 'admin';

  const currentPersona = PERSONAS.find((p) => p.key === activeKey) || PERSONAS[0];

  const handleSelect = async (persona) => {
    if (persona.key === activeKey && isAuthenticated) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setIsOpen(false);
    try {
      await switchPersona(persona.key);
      toast.success(`Switched active demo persona to: ${persona.name}`);
      navigate(persona.destination);
    } catch {
      toast.error('Unable to switch persona. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  const IconComponent = currentPersona.icon;

  return (
    <div className={`persona-switcher ${compact ? 'is-compact' : ''}`} ref={menuRef}>
      <button
        type="button"
        className={`persona-switcher__trigger ${isOpen ? 'is-open' : ''} ${isSwitching ? 'is-loading' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Interactive Portfolio Switcher: test all roles instantly without separate logins"
      >
        <span className="persona-switcher__dot" />
        <span className="persona-switcher__pill-label">DEMO:</span>
        <span className="persona-switcher__name">
          <IconComponent size={13} className="persona-icon-inline" />
          {currentPersona.badge}
        </span>
        <ChevronDown size={13} className={`persona-chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="persona-switcher__dropdown" role="listbox">
          <div className="persona-dropdown-header">
            <span className="persona-dropdown-kicker">Interactive Persona Switcher</span>
            <span className="persona-dropdown-hint">Toggle between roles instantly to test all workflows:</span>
          </div>

          <div className="persona-dropdown-list">
            {PERSONAS.map((persona) => {
              const ItemIcon = persona.icon;
              const isSelected = persona.key === activeKey;

              return (
                <button
                  key={persona.key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`persona-option-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(persona)}
                  disabled={isSwitching}
                >
                  <div className="persona-item-icon-box">
                    <ItemIcon size={16} />
                  </div>
                  <div className="persona-item-info">
                    <div className="persona-item-title-row">
                      <span className="persona-item-title">{persona.name}</span>
                      <span className="persona-item-tag">{persona.badge}</span>
                    </div>
                    <p className="persona-item-desc">{persona.subtitle}</p>
                  </div>
                  {isSelected && <Check size={16} className="persona-selected-check" />}
                </button>
              );
            })}
          </div>

          <div className="persona-dropdown-footer">
            <span>Portfolio Demo Mode (Section 3a ACJA 2015)</span>
          </div>
        </div>
      )}
    </div>
  );
}
