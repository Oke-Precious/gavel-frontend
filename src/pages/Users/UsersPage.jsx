import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, RotateCcw, UserPlus } from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import { usersApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validateEmail } from '../../utils/validators.js';
import './UsersPage.css';

const ROLE_CONFIG = {
  admin: { label: 'Admin', tone: 'indigo' },
  judge: { label: 'Legal Aid Officer', tone: 'navy' },
  clerk: { label: 'Records Officer', tone: 'neutral' },
  lawyer: { label: 'Volunteer Lawyer', tone: 'indigo' },
  litigant: { label: 'Public Observer', tone: 'neutral' },
  public: { label: 'Public Observer', tone: 'neutral' },
};

function normalizeUser(user) {
  const explicitStatus = String(user.accountStatus ?? user.status ?? '').toLowerCase();
  return {
    ...user,
    _id: user._id ?? user.id,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '—',
    role: user.role ?? 'public',
    state: user.assignedState ?? user.state ?? '—',
    isActive: typeof user.isActive === 'boolean'
      ? user.isActive
      : explicitStatus !== 'suspended',
  };
}

function activeCaseCount(user) {
  const possibleCounts = [
    user?.activeCaseCount,
    user?.activeAssignedCases,
    user?.assignedActiveCases,
    user?.activeCasesCount,
  ];
  const count = possibleCounts.find((value) => Number.isFinite(Number(value)));
  if (count != null) return Number(count);
  if (Array.isArray(user?.activeCases)) return user.activeCases.length;
  return 0;
}

function requestErrorMessage(error, fallback) {
  if (!error?.response) {
    return 'Network error — check your connection and try again.';
  }
  if (error.response.status >= 500) {
    return 'Something went wrong on our end. Please try again in a moment.';
  }
  return error.response.data?.message ?? fallback;
}

export default function UsersPage() {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState('judge');
  const [inviteCourt, setInviteCourt] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await usersApi.list({ limit: 100 });
      const items = Array.isArray(data) ? data : (data?.users ?? data?.items ?? []);
      setUsersList(items.map(normalizeUser));
    } catch (error) {
      const message = requestErrorMessage(error, 'Unable to load user accounts.');
      setUsersList([]);
      setLoadError({ message });
      toastRef.current.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadUsers]);

  function openAccountAction(user, action) {
    setSelectedUser(user);
    setPendingAction(action);
    setSuspensionReason('');
  }

  function closeAccountAction() {
    if (isUpdatingAccount) return;
    setSelectedUser(null);
    setPendingAction(null);
    setSuspensionReason('');
  }

  async function handleAccountAction(event) {
    event.preventDefault();
    if (!selectedUser || !pendingAction) return;

    const name = `${selectedUser.firstName} ${selectedUser.lastName}`.trim();
    setIsUpdatingAccount(true);
    try {
      let actionResult;
      if (pendingAction === 'suspend') {
        actionResult = await usersApi.suspend(selectedUser._id, suspensionReason.trim());
      } else {
        actionResult = await usersApi.reactivate(selectedUser._id);
      }

      const isNowActive = pendingAction === 'reactivate';
      setUsersList((current) => current.map((user) => (
        user._id === selectedUser._id ? { ...user, isActive: isNowActive } : user
      )));
      toast.success(`${name} has been ${isNowActive ? 'reactivated' : 'suspended'}`);
      const returnedActiveCases = activeCaseCount(actionResult);
      if (!isNowActive && returnedActiveCases > 0) {
        toast.info(`${name} had ${returnedActiveCases} active case${returnedActiveCases === 1 ? '' : 's'} assigned at suspension.`);
      }
      setSelectedUser(null);
      setPendingAction(null);
      setSuspensionReason('');
    } catch (error) {
      const fallback = pendingAction === 'suspend'
        ? `Unable to suspend ${name}.`
        : `Unable to reactivate ${name}.`;
      toast.error(requestErrorMessage(error, fallback));
    } finally {
      setIsUpdatingAccount(false);
    }
  }

  async function handleInviteSubmit(event) {
    event.preventDefault();
    if (!inviteEmail.trim() || !inviteFirstName.trim() || !inviteLastName.trim()) {
      toast.warning('Please enter the first name, last name, and email address.');
      return;
    }
    const emailError = validateEmail(inviteEmail);
    if (emailError) {
      toast.warning(emailError);
      return;
    }

    setIsSubmittingInvite(true);
    try {
      const created = await usersApi.invite({
        email: inviteEmail.trim(),
        firstName: inviteFirstName.trim(),
        lastName: inviteLastName.trim(),
        role: inviteRole,
        court: inviteCourt.trim() || undefined,
      });
      const newUser = normalizeUser(created?.user ?? created);
      if (newUser._id) {
        setUsersList((current) => [newUser, ...current]);
      } else {
        await loadUsers();
      }
      toast.success(`Invitation email sent to ${inviteEmail.trim()}`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
      setInviteRole('judge');
      setInviteCourt('');
    } catch (error) {
      toast.error(requestErrorMessage(error, 'Unable to invite this user.'));
    } finally {
      setIsSubmittingInvite(false);
    }
  }

  const columns = [
    {
      key: 'firstName',
      label: 'Name',
      render: (_, row) => <span className="users-name">{row.firstName} {row.lastName}</span>,
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (role) => {
        const config = ROLE_CONFIG[role] ?? { label: role, tone: 'neutral' };
        return <Badge tone={config.tone}>{config.label}</Badge>;
      },
    },
    { key: 'state', label: 'State' },
    {
      key: 'isActive',
      label: 'Account Status',
      render: (isActive) => (
        <Badge tone={isActive ? 'compliant' : 'critical'}>
          {isActive ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    {
      key: '_id',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant={row.isActive ? 'danger' : 'secondary'}
          size="md"
          onClick={() => openAccountAction(row, row.isActive ? 'suspend' : 'reactivate')}
        >
          {row.isActive ? 'Suspend' : 'Reactivate'}
        </Button>
      ),
    },
  ];

  const selectedName = selectedUser
    ? `${selectedUser.firstName} ${selectedUser.lastName}`.trim()
    : '';
  const selectedActiveCases = activeCaseCount(selectedUser);
  const isSuspending = pendingAction === 'suspend';

  return (
    <div className="users-page">
      <div className="users-container">
        <div className="users-header">
          <div className="users-header__copy">
            <h1 className="users-title">User Management</h1>
            <p className="users-subtitle">Manage officer and volunteer access across GAVEL.</p>
          </div>
          <Button
            variant="primary"
            size="md"
            iconLeft={UserPlus}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite User
          </Button>
        </div>

        {loadError && (
          <Card padding="md" className="users-retry" role="status">
            <span>{loadError.message}</span>
            <Button variant="secondary" size="md" iconLeft={RotateCcw} onClick={loadUsers}>
              Try Again
            </Button>
          </Card>
        )}

        {!loadError && (
          <DataTable
            columns={columns}
            data={usersList}
            loading={loading}
            rowIdKey="_id"
            emptyMessage="No user accounts found. Invite a user to get started."
          />
        )}

        <Modal
          isOpen={Boolean(pendingAction && selectedUser)}
          onClose={closeAccountAction}
          title={isSuspending ? 'Suspend User' : 'Reactivate User'}
          size="sm"
          closeOnBackdrop={!isUpdatingAccount}
          showCloseButton={!isUpdatingAccount}
        >
          <form onSubmit={handleAccountAction} className="account-action-form">
            <p className="account-action-form__message">
              {isSuspending
                ? `Are you sure you want to suspend ${selectedName}? They will be logged out immediately and unable to sign in until reactivated.`
                : `Are you sure you want to reactivate ${selectedName}? They'll regain access immediately.`}
            </p>

            {isSuspending && selectedActiveCases > 0 && (
              <div className="account-action-form__warning" role="note">
                <AlertTriangle size={20} aria-hidden="true" />
                <span>
                  This officer has {selectedActiveCases} active case{selectedActiveCases === 1 ? '' : 's'} assigned.
                </span>
              </div>
            )}

            {isSuspending && (
              <div className="users-form-field">
                <label htmlFor="suspension-reason" className="users-form-label">
                  Reason <span className="users-form-optional">(optional)</span>
                </label>
                <textarea
                  id="suspension-reason"
                  className="users-form-textarea"
                  rows={4}
                  value={suspensionReason}
                  onChange={(event) => setSuspensionReason(event.target.value)}
                  placeholder="Add context for the audit log"
                  disabled={isUpdatingAccount}
                />
              </div>
            )}

            <div className="users-modal-actions">
              <Button type="button" variant="ghost" size="md" onClick={closeAccountAction} disabled={isUpdatingAccount}>
                Cancel
              </Button>
              <Button type="submit" variant={isSuspending ? 'danger' : 'primary'} size="md" loading={isUpdatingAccount}>
                {isSuspending ? 'Suspend User' : 'Reactivate User'}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite User"
          size="md"
          closeOnBackdrop={!isSubmittingInvite}
          showCloseButton={!isSubmittingInvite}
        >
          <form onSubmit={handleInviteSubmit} className="invite-modal-form" noValidate>
            <div className="invite-modal-form__name-row">
              <div className="users-form-field">
                <label htmlFor="invite-first-name" className="users-form-label">First Name</label>
                <input id="invite-first-name" type="text" className="users-form-input" value={inviteFirstName} onChange={(event) => setInviteFirstName(event.target.value)} disabled={isSubmittingInvite} required />
              </div>
              <div className="users-form-field">
                <label htmlFor="invite-last-name" className="users-form-label">Last Name</label>
                <input id="invite-last-name" type="text" className="users-form-input" value={inviteLastName} onChange={(event) => setInviteLastName(event.target.value)} disabled={isSubmittingInvite} required />
              </div>
            </div>

            <div className="users-form-field">
              <label htmlFor="invite-email" className="users-form-label">Email</label>
              <input id="invite-email" type="email" className="users-form-input" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} disabled={isSubmittingInvite} required />
            </div>

            <div className="users-form-field">
              <label htmlFor="invite-role" className="users-form-label">Role</label>
              <select id="invite-role" className="users-form-input" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)} disabled={isSubmittingInvite}>
                <option value="judge">Legal Aid Officer</option>
                <option value="clerk">Records Officer</option>
                <option value="lawyer">Volunteer Lawyer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="users-form-field">
              <label htmlFor="invite-court" className="users-form-label">
                Assigned Court <span className="users-form-optional">(optional)</span>
              </label>
              <input id="invite-court" type="text" className="users-form-input" value={inviteCourt} onChange={(event) => setInviteCourt(event.target.value)} disabled={isSubmittingInvite} placeholder="e.g. Ikeja Magistrate Court" />
            </div>

            <div className="users-modal-actions">
              <Button type="button" variant="ghost" size="md" onClick={() => setIsInviteModalOpen(false)} disabled={isSubmittingInvite}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={isSubmittingInvite}>
                Invite User
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
