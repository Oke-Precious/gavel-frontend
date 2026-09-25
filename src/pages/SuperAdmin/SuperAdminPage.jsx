import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ClipboardList,
  Edit3,
  FileWarning,
  History,
  Mail,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { superAdminApi } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import AdminOverviewPage from '../AdminOverview/AdminOverviewPage.jsx';
import './SuperAdminPage.css';

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', tone: 'critical' },
  admin: { label: 'Admin', tone: 'indigo' },
  judge: { label: 'Legal Aid Officer', tone: 'navy' },
  lawyer: { label: 'Volunteer Lawyer', tone: 'indigo' },
  clerk: { label: 'Records Officer', tone: 'neutral' },
  litigant: { label: 'Public Observer', tone: 'neutral' },
  public: { label: 'Public Observer', tone: 'neutral' },
};

const ROLE_OPTIONS = ['admin', 'judge', 'lawyer', 'clerk', 'litigant', 'public'];
const ROLE_FILTER_OPTIONS = ['super_admin', ...ROLE_OPTIONS];

function displayRole(role) {
  return ROLE_CONFIG[role]?.label ?? role ?? 'Unknown';
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function errorMessage(error, fallback) {
  if (!error?.response) return 'Network error - check your connection and try again.';
  if (error.response.status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  return error.response.data?.message ?? fallback;
}

function normalizeUser(user) {
  const status = String(user?.accountStatus ?? user?.status ?? '').toLowerCase();
  return {
    ...user,
    _id: user?._id ?? user?.id,
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '-',
    role: user?.role ?? 'public',
    status: status || (user?.isActive === false ? 'suspended' : 'active'),
    isActive: typeof user?.isActive === 'boolean' ? user.isActive : status !== 'suspended',
    emailVerified: Boolean(user?.emailVerified ?? user?.isEmailVerified ?? user?.verified),
    lastLogin: user?.lastLoginAt ?? user?.lastLogin,
    createdAt: user?.createdAt,
    activeCasesCount: Number(user?.activeCasesCount ?? user?.activeCaseCount ?? 0),
  };
}

function listFrom(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
}

const initialInvite = { firstName: '', lastName: '', email: '', role: 'admin' };
const initialEdit = { firstName: '', lastName: '', phoneNumber: '', barNumber: '', role: 'admin' };

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modal, setModal] = useState(null);
  const [inviteForm, setInviteForm] = useState(initialInvite);
  const [editForm, setEditForm] = useState(initialEdit);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionConfirmation, setDeletionConfirmation] = useState('');
  const [deletionAcknowledged, setDeletionAcknowledged] = useState(false);
  const [deletionCheck, setDeletionCheck] = useState(null);
  const [deletionCheckError, setDeletionCheckError] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const currentUserId = user?._id ?? user?.id;

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await superAdminApi.getUsers({ page: userPage, limit: 20, ...(roleFilter ? { role: roleFilter } : {}) });
      const items = listFrom(data, ['users', 'items']);
      setUsers(items.map(normalizeUser));
      setUserPages(Number(data?.totalPages ?? data?.pagination?.pages ?? 1));
      setUserTotal(Number(data?.totalUsers ?? data?.pagination?.total ?? items.length));
    } catch (error) {
      const message = errorMessage(error, 'Unable to load user accounts.');
      setUsersError(message);
      setUsers([]);
      toastRef.current.error(message);
    } finally {
      setUsersLoading(false);
    }
  }, [roleFilter, userPage]);

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const visibleUsers = useMemo(
    () => users.filter((item) => !statusFilter || (statusFilter === 'active' ? item.isActive : !item.isActive)),
    [statusFilter, users],
  );

  function canManage(target) {
    return target?._id && target.role !== 'super_admin' && target._id !== currentUserId;
  }

  function closeModal(force = false) {
    if (modalLoading && !force) return;
    setModal(null);
    setDeletionCheck(null);
    setDeletionCheckError(null);
    setDeletionReason('');
    setDeletionConfirmation('');
    setDeletionAcknowledged(false);
    setSuspensionReason('');
    setAuditLogs([]);
  }

  function openInvite() {
    setInviteForm(initialInvite);
    setModal({ type: 'invite' });
  }

  function openEdit(target) {
    setEditForm({
      firstName: target.firstName,
      lastName: target.lastName,
      phoneNumber: target.phoneNumber ?? '',
      barNumber: target.barNumber ?? '',
      role: target.role,
    });
    setModal({ type: 'edit', user: target });
  }

  function openAccountAction(target, type) {
    setSuspensionReason('');
    setModal({ type, user: target });
  }

  async function openAudit(target) {
    setModal({ type: 'audit', user: target });
    setModalLoading(true);
    try {
      const data = await superAdminApi.getUserAuditLog(target._id);
      setAuditLogs(listFrom(data, ['logs', 'auditLogs', 'items']));
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to load this user activity.'));
    } finally {
      setModalLoading(false);
    }
  }

  async function openDeletion(target) {
    setModal({ type: 'delete', user: target });
    setDeletionCheck(null);
    setDeletionCheckError(null);
    setDeletionReason('');
    setDeletionConfirmation('');
    setDeletionAcknowledged(false);
    setModalLoading(true);
    try {
      const data = await superAdminApi.checkUserDeletion(target._id);
      setDeletionCheck(data);
    } catch (error) {
      const message = errorMessage(error, 'Unable to check deletion eligibility.');
      setDeletionCheckError(message);
      toast.error(message);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleInvite(event) {
    event.preventDefault();
    if (!inviteForm.firstName.trim() || !inviteForm.lastName.trim() || !inviteForm.email.trim()) {
      toast.warning('First name, last name, and email are required.');
      return;
    }
    setModalLoading(true);
    try {
      await superAdminApi.inviteUser({ ...inviteForm, firstName: inviteForm.firstName.trim(), lastName: inviteForm.lastName.trim(), email: inviteForm.email.trim() });
      toast.success(`Invitation sent to ${inviteForm.email.trim()}`);
      closeModal(true);
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to create this user.'));
    } finally {
      setModalLoading(false);
    }
  }

  async function handleEdit(event) {
    event.preventDefault();
    if (!modal?.user) return;
    setModalLoading(true);
    try {
      await superAdminApi.updateUser(modal.user._id, editForm);
      toast.success(`${modal.user.firstName} ${modal.user.lastName} was updated.`);
      closeModal(true);
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to update this user.'));
    } finally {
      setModalLoading(false);
    }
  }

  async function handleSuspend(event) {
    event.preventDefault();
    if (!modal?.user) return;
    if (suspensionReason.trim().length < 10) {
      toast.warning('Please provide a suspension reason of at least 10 characters.');
      return;
    }
    if (suspensionReason.trim().length > 500) {
      toast.warning('Suspension reasons must be 500 characters or fewer.');
      return;
    }
    setModalLoading(true);
    try {
      const result = await superAdminApi.suspendUser(modal.user._id, suspensionReason.trim());
      const count = Number(result?.activeCasesCount ?? result?.user?.activeCasesCount ?? 0);
      toast.success(`${modal.user.firstName} ${modal.user.lastName} has been suspended.`);
      if (count > 0) toast.warning(`This officer has ${count} active case${count === 1 ? '' : 's'} assigned.`);
      closeModal(true);
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to suspend this user.'));
    } finally {
      setModalLoading(false);
    }
  }

  async function handleReactivate() {
    if (!modal?.user) return;
    setModalLoading(true);
    try {
      await superAdminApi.reactivateUser(modal.user._id);
      toast.success(`${modal.user.firstName} ${modal.user.lastName} has been reactivated.`);
      closeModal(true);
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to reactivate this user.'));
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDelete(event) {
    event.preventDefault();
    if (!modal?.user || !deletionCheck?.canDelete) return;
    if (deletionReason.trim().length < 10 || deletionReason.trim().length > 500) {
      toast.warning('Deletion reasons must be between 10 and 500 characters.');
      return;
    }
    if (deletionConfirmation !== deletionCheck.requiredConfirmation) {
      toast.warning('Type the exact confirmation phrase to continue.');
      return;
    }
    if (!deletionAcknowledged) {
      toast.warning('Confirm that you understand this deletion cannot be undone.');
      return;
    }
    setModalLoading(true);
    try {
      await superAdminApi.deleteUser(modal.user._id, { reason: deletionReason.trim(), confirmation: deletionConfirmation });
      toast.success(`${modal.user.firstName} ${modal.user.lastName} was permanently deleted.`);
      closeModal(true);
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to delete this user.'));
    } finally {
      setModalLoading(false);
    }
  }

  const userColumns = [
    {
      key: 'firstName',
      label: 'Full name',
      render: (_, row) => <span className="super-admin__name">{row.firstName} {row.lastName}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (value) => <Badge tone={ROLE_CONFIG[value]?.tone ?? 'neutral'}>{displayRole(value)}</Badge> },
    { key: 'status', label: 'Account status', render: (value, row) => <Badge tone={row.isActive ? 'compliant' : 'critical'}>{value === 'suspended' ? 'Suspended' : 'Active'}</Badge> },
    { key: 'emailVerified', label: 'Email verified', render: (value) => <Badge tone={value ? 'compliant' : 'warning'}>{value ? 'Verified' : 'Pending'}</Badge> },
    { key: 'isActive', label: 'Active / inactive', render: (value) => value ? 'Active' : 'Inactive' },
    { key: 'lastLogin', label: 'Last login', render: (value) => formatDateTime(value) },
    { key: 'createdAt', label: 'Created date', render: (value) => formatDate(value) },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => canManage(row) ? (
        <div className="super-admin__row-actions">
          <button className="super-admin__table-action" onClick={() => openEdit(row)} aria-label={`Edit ${row.firstName} ${row.lastName}`}><Edit3 size={15} aria-hidden="true" /> Edit</button>
          <button className="super-admin__table-action" onClick={() => openAudit(row)} aria-label={`View activity for ${row.firstName} ${row.lastName}`}><History size={15} aria-hidden="true" /> Activity</button>
          <button className="super-admin__table-action super-admin__table-action--danger" onClick={() => openDeletion(row)} aria-label={`Delete ${row.firstName} ${row.lastName}`}><Trash2 size={15} aria-hidden="true" /> Delete</button>
          <Button variant={row.isActive ? 'danger' : 'secondary'} size="sm" onClick={() => openAccountAction(row, row.isActive ? 'suspend' : 'reactivate')}>
            {row.isActive ? 'Suspend' : 'Reactivate'}
          </Button>
        </div>
      ) : <span className="super-admin__protected">Protected</span>,
    },
  ];

  const filteredUsersCount = visibleUsers.length;
  return (
    <div className="super-admin-page">
      <AdminOverviewPage />
      <div className="super-admin-container">
        <header className="super-admin__header">
          <div>
            <p className="super-admin__eyebrow">GAVEL governance console</p>
            <h2 className="super-admin__title">Super Admin Governance</h2>
            <p className="super-admin__subtitle">Safeguard access, accountability, and the public record across the platform.</p>
          </div>
          <Button variant="primary" size="md" iconLeft={UserPlus} onClick={openInvite}>Create User</Button>
        </header>

        <section className="super-admin__quick-links" aria-label="Super Admin shortcuts">
          <Button variant="secondary" size="md" iconLeft={Users} onClick={() => document.getElementById('super-admin-users')?.scrollIntoView({ behavior: 'smooth' })}>Manage users</Button>
          <Button variant="secondary" size="md" iconLeft={Mail} onClick={() => navigate('/contact-messages')}>Contact inbox</Button>
          <Button variant="secondary" size="md" iconLeft={ClipboardList} onClick={() => navigate('/cases')}>View cases</Button>
          <Button variant="secondary" size="md" iconLeft={Plus} onClick={() => navigate('/cases/new')}>Create case</Button>
        </section>

        <section id="super-admin-users" className="super-admin__section">
          <div className="super-admin__section-heading super-admin__section-heading--wide"><div><p className="super-admin__eyebrow">Access control</p><h2>User management</h2><p className="super-admin__muted">{userTotal.toLocaleString()} accounts across GAVEL.</p></div><Button variant="primary" size="md" iconLeft={UserPlus} onClick={openInvite}>Create User</Button></div>
          <Card padding="md">
            <div className="super-admin__filters" role="search">
              <label><span>Role</span><select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setUserPage(1); }}><option value="">All roles</option>{ROLE_FILTER_OPTIONS.map((role) => <option key={role} value={role}>{displayRole(role)}</option>)}</select></label>
              <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
              <Button variant="ghost" size="sm" iconLeft={RefreshCw} onClick={loadUsers}>Refresh</Button>
            </div>
            <div className="super-admin__users-table">
              <DataTable columns={userColumns} data={visibleUsers} loading={usersLoading} error={usersError} rowIdKey="_id" emptyMessage="No users match the selected filters." pagination={userPages > 1 ? { page: userPage, totalPages: userPages, totalItems: userTotal, limit: 20, onPageChange: setUserPage } : null} />
            </div>
            {!usersLoading && !usersError && <p className="super-admin__count-line" aria-live="polite">Showing {filteredUsersCount} user{filteredUsersCount === 1 ? '' : 's'} on this page.</p>}
          </Card>
        </section>

      </div>

      <Modal isOpen={modal?.type === 'invite'} onClose={closeModal} title="Create user" size="md" closeOnBackdrop={!modalLoading} showCloseButton={!modalLoading}>
        <form className="super-admin__form" onSubmit={handleInvite} noValidate><p className="super-admin__form-note">Invited users receive a temporary password by email. Super Admin accounts can only be created through the backend bootstrap process.</p><div className="super-admin__form-grid"><Field id="invite-first-name" label="First name" value={inviteForm.firstName} onChange={(value) => setInviteForm((form) => ({ ...form, firstName: value }))} disabled={modalLoading} required /><Field id="invite-last-name" label="Last name" value={inviteForm.lastName} onChange={(value) => setInviteForm((form) => ({ ...form, lastName: value }))} disabled={modalLoading} required /></div><Field id="invite-email" label="Email" type="email" value={inviteForm.email} onChange={(value) => setInviteForm((form) => ({ ...form, email: value }))} disabled={modalLoading} required /><SelectField id="invite-role" label="Role" value={inviteForm.role} onChange={(value) => setInviteForm((form) => ({ ...form, role: value }))} options={ROLE_OPTIONS} disabled={modalLoading} /><FormActions onCancel={closeModal} loading={modalLoading} submitLabel="Create user" /></form>
      </Modal>

      <Modal isOpen={modal?.type === 'edit'} onClose={closeModal} title="Edit user" size="md" closeOnBackdrop={!modalLoading} showCloseButton={!modalLoading}>
        <form className="super-admin__form" onSubmit={handleEdit}><div className="super-admin__form-grid"><Field id="edit-first-name" label="First name" value={editForm.firstName} onChange={(value) => setEditForm((form) => ({ ...form, firstName: value }))} disabled={modalLoading} required /><Field id="edit-last-name" label="Last name" value={editForm.lastName} onChange={(value) => setEditForm((form) => ({ ...form, lastName: value }))} disabled={modalLoading} required /></div><Field id="edit-phone" label="Phone number" value={editForm.phoneNumber} onChange={(value) => setEditForm((form) => ({ ...form, phoneNumber: value }))} disabled={modalLoading} /><Field id="edit-bar" label="Bar number" value={editForm.barNumber} onChange={(value) => setEditForm((form) => ({ ...form, barNumber: value }))} disabled={modalLoading} /><SelectField id="edit-role" label="Role" value={editForm.role} onChange={(value) => setEditForm((form) => ({ ...form, role: value }))} options={ROLE_OPTIONS} disabled={modalLoading || modal?.user?._id === currentUserId || modal?.user?.role === 'super_admin'} /><FormActions onCancel={closeModal} loading={modalLoading} submitLabel="Save changes" /></form>
      </Modal>

      <Modal isOpen={modal?.type === 'suspend'} onClose={closeModal} title="Suspend user" size="sm" closeOnBackdrop={!modalLoading} showCloseButton={!modalLoading}>
        <form className="super-admin__form" onSubmit={handleSuspend}><p>Are you sure you want to suspend <strong>{modal?.user?.firstName} {modal?.user?.lastName}</strong>?</p><dl className="super-admin__identity-list"><div><dt>Email</dt><dd>{modal?.user?.email}</dd></div><div><dt>Current role</dt><dd>{displayRole(modal?.user?.role)}</dd></div></dl><div className="super-admin__warning" role="note"><AlertTriangle size={18} aria-hidden="true" /> Active sessions will become unusable immediately.</div>{modal?.user?.activeCasesCount > 0 && <div className="super-admin__warning" role="note">This officer has {modal?.user?.activeCasesCount} active case{modal?.user?.activeCasesCount === 1 ? '' : 's'} assigned.</div>}<label className="super-admin__field"><span>Reason (recommended)</span><textarea rows={4} maxLength={500} value={suspensionReason} onChange={(event) => setSuspensionReason(event.target.value)} disabled={modalLoading} placeholder="At least 10 characters" required /></label><FormActions onCancel={closeModal} loading={modalLoading} submitLabel="Confirm suspension" danger /></form>
      </Modal>

      <Modal isOpen={modal?.type === 'reactivate'} onClose={closeModal} title="Reactivate user" size="sm" closeOnBackdrop={!modalLoading} showCloseButton={!modalLoading}>
        <div className="super-admin__form"><p>Are you sure you want to reactivate <strong>{modal?.user?.firstName} {modal?.user?.lastName}</strong>? They will regain access immediately.</p><dl className="super-admin__identity-list"><div><dt>Email</dt><dd>{modal?.user?.email}</dd></div><div><dt>Current role</dt><dd>{displayRole(modal?.user?.role)}</dd></div></dl><FormActions onCancel={closeModal} onSubmit={handleReactivate} loading={modalLoading} submitLabel="Confirm reactivation" /></div>
      </Modal>

      <Modal isOpen={modal?.type === 'audit'} onClose={closeModal} title="User activity" size="md" closeOnBackdrop={!modalLoading} showCloseButton={!modalLoading}>
        <div className="super-admin__audit"><p className="super-admin__form-note">Suspension and reactivation history for <strong>{modal?.user?.firstName} {modal?.user?.lastName}</strong>.</p>{modalLoading ? <Skeleton variant="card" height={120} /> : auditLogs.length === 0 ? <p className="super-admin__muted">No suspension or reactivation activity recorded.</p> : <ol className="super-admin__audit-list">{auditLogs.map((entry, index) => <li key={entry._id ?? index}><div className="super-admin__audit-marker" aria-hidden="true" /> <div><strong>{entry.action ?? entry.type ?? 'Account update'}</strong><p>{entry.reason || 'No reason provided.'}</p><span>{entry.performedBy?.firstName ? `${entry.performedBy.firstName} ${entry.performedBy.lastName ?? ''}`.trim() : entry.administrator ?? 'Administrator'} - {formatDateTime(entry.createdAt ?? entry.date)}</span></div></li>)}</ol>}</div>
      </Modal>

      <Modal isOpen={modal?.type === 'delete'} onClose={closeModal} title="Permanently delete user" size="md" closeOnBackdrop={!modalLoading} showCloseButton={!modalLoading}>
        <form className="super-admin__form" onSubmit={handleDelete}>
          <p>This action permanently removes <strong>{modal?.user?.firstName} {modal?.user?.lastName}</strong> and cannot be undone.</p>
          {modalLoading && !deletionCheck ? (
            <Skeleton variant="card" height={120} />
          ) : deletionCheckError ? (
            <div className="super-admin__inline-error" role="alert">
              <span>{deletionCheckError}</span>
              <Button type="button" variant="secondary" size="sm" onClick={() => modal?.user && openDeletion(modal.user)}>Check again</Button>
            </div>
          ) : deletionCheck && (
            <>
              <dl className="super-admin__identity-list">
                <div><dt>Email</dt><dd>{modal?.user?.email}</dd></div>
                <div><dt>Role</dt><dd>{displayRole(modal?.user?.role)}</dd></div>
                <div><dt>Eligible for deletion</dt><dd><Badge tone={deletionCheck.canDelete ? 'compliant' : 'critical'}>{deletionCheck.canDelete ? 'Yes' : 'No'}</Badge></dd></div>
              </dl>
              {!deletionCheck.canDelete && (
                <div className="super-admin__warning" role="alert">
                  <FileWarning size={18} aria-hidden="true" />
                  <span>This account cannot be deleted yet. Its operational records must be reassigned or removed first.</span>
                </div>
              )}
              <div className="super-admin__dependency-grid">
                {Object.entries(deletionCheck.dependencies ?? {}).filter(([, count]) => Number(count) > 0).map(([key, count]) => (
                  <span key={key}><strong>{count}</strong> {key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                ))}
                {Object.values(deletionCheck.dependencies ?? {}).every((count) => Number(count) === 0) && <span>No operational dependencies found.</span>}
              </div>
              {deletionCheck.canDelete && (
                <>
                  <label className="super-admin__field">
                    <span>Deletion reason (10–500 characters)</span>
                    <textarea rows={3} minLength={10} maxLength={500} value={deletionReason} onChange={(event) => setDeletionReason(event.target.value)} disabled={modalLoading} required />
                  </label>
                  <label className="super-admin__deletion-acknowledgement">
                    <input type="checkbox" checked={deletionAcknowledged} onChange={(event) => setDeletionAcknowledged(event.target.checked)} disabled={modalLoading} />
                    <span>I understand this permanently deletes the account and cannot be undone.</span>
                  </label>
                  <label className="super-admin__field">
                    <span>Type <strong>{deletionCheck.requiredConfirmation}</strong> exactly to confirm</span>
                    <input value={deletionConfirmation} onChange={(event) => setDeletionConfirmation(event.target.value)} disabled={modalLoading} autoComplete="off" spellCheck="false" required />
                  </label>
                  <FormActions
                    onCancel={closeModal}
                    loading={modalLoading}
                    submitLabel="Delete permanently"
                    danger
                    disabled={!deletionAcknowledged || deletionConfirmation !== deletionCheck.requiredConfirmation || deletionReason.trim().length < 10 || deletionReason.trim().length > 500}
                  />
                </>
              )}
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}

function Field({ id, label, value, onChange, type = 'text', disabled, required = false }) {
  return <label className="super-admin__field" htmlFor={id}><span>{label}</span><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} required={required} /></label>;
}

function SelectField({ id, label, value, onChange, options, disabled }) {
  return <label className="super-admin__field" htmlFor={id}><span>{label}</span><select id={id} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>{options.map((option) => <option key={option} value={option}>{displayRole(option)}</option>)}</select></label>;
}

function FormActions({ onCancel, onSubmit, loading, submitLabel, danger = false, disabled = false }) {
  return <div className="super-admin__form-actions"><Button type="button" variant="ghost" size="md" onClick={onCancel} disabled={loading}>Cancel</Button><Button type={onSubmit ? 'button' : 'submit'} variant={danger ? 'danger' : 'primary'} size="md" onClick={onSubmit} loading={loading} disabled={disabled}>{submitLabel}</Button></div>;
}
