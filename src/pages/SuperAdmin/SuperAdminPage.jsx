import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Edit3,
  FileWarning,
  HeartHandshake,
  History,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
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
const CONTACT_STATUSES = ['new', 'in_review', 'resolved', 'closed'];
const CONTACT_CATEGORIES = [
  'general_question',
  'report_issue',
  'privacy_concern',
  'case_information_concern',
  'volunteer_legal_aid',
];

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

function normalizeContact(message) {
  return {
    ...message,
    _id: message?._id ?? message?.id ?? message?.messageId,
    name: message?.name || 'Not provided',
    email: message?.email || '-',
    category: message?.category || 'general_question',
    message: message?.message || '-',
    status: message?.status || 'new',
    createdAt: message?.createdAt,
    resolvedAt: message?.resolvedAt,
    adminNotes: message?.adminNotes || '',
    assignedTo: message?.resolvedBy?.firstName
      ? `${message.resolvedBy.firstName} ${message.resolvedBy.lastName ?? ''}`.trim()
      : message?.assignedResolutionAdministrator ?? message?.resolvedBy?.email ?? '-',
  };
}

function listFrom(data, keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
}

function labelFromToken(value) {
  return String(value ?? 'not_provided').replace(/_/g, ' ');
}

function normalizeRoleCounts(overview, users) {
  const roles = overview?.users?.roles ?? overview?.roles;
  if (Array.isArray(roles)) {
    return roles.reduce((acc, item) => ({
      ...acc,
      [item._id ?? item.role]: Number(item.count ?? item.total ?? 0),
    }), {});
  }

  const fromApi = overview?.users?.byRole ?? overview?.usersByRole ?? overview?.roleCounts;
  if (fromApi && typeof fromApi === 'object' && !Array.isArray(fromApi)) return fromApi;

  return users.reduce((acc, item) => ({ ...acc, [item.role]: (acc[item.role] ?? 0) + 1 }), {});
}

function normalizeTrendRows(rows) {
  return rows.map((row) => {
    const year = row._id?.year ?? row.year;
    const month = row._id?.month ?? row.month;
    const period = row.period ?? row.label ?? (year && month ? `${year}-${String(month).padStart(2, '0')}` : '-');
    return {
      ...row,
      period,
      status: row.status ?? row._id?.status ?? 'Not provided',
      count: Number(row.count ?? row.total ?? 0),
    };
  });
}
function countValue(source, keys) {
  for (const key of keys) {
    const value = key.split('.').reduce((result, part) => result?.[part], source);
    if (value !== undefined && value !== null && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}

const initialInvite = { firstName: '', lastName: '', email: '', role: 'admin' };
const initialEdit = { firstName: '', lastName: '', phoneNumber: '', barNumber: '', role: 'admin' };

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);

  const [overview, setOverview] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [trends, setTrends] = useState([]);
  const [health, setHealth] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState(null);
  const [contactPage, setContactPage] = useState(1);
  const [contactPages, setContactPages] = useState(1);
  const [contactTotal, setContactTotal] = useState(0);
  const [contactStatus, setContactStatus] = useState('');
  const [contactCategory, setContactCategory] = useState('');
  const [contactDrafts, setContactDrafts] = useState({});

  const [modal, setModal] = useState(null);
  const [inviteForm, setInviteForm] = useState(initialInvite);
  const [editForm, setEditForm] = useState(initialEdit);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionConfirmation, setDeletionConfirmation] = useState('');
  const [deletionCheck, setDeletionCheck] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const currentUserId = user?._id ?? user?.id;

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError(null);
    const results = await Promise.allSettled([
      superAdminApi.getOverview(),
      superAdminApi.getHeatmap(),
      superAdminApi.getTrends(),
      superAdminApi.getHealth(),
    ]);
    const [overviewResult, heatmapResult, trendsResult, healthResult] = results;
    if (overviewResult.status === 'fulfilled') setOverview(overviewResult.value);
    if (heatmapResult.status === 'fulfilled') setHeatmap(listFrom(heatmapResult.value, ['heatmap', 'rows']));
    if (trendsResult.status === 'fulfilled') setTrends(normalizeTrendRows(listFrom(trendsResult.value, ['trends', 'rows'])));
    if (healthResult.status === 'fulfilled') setHealth(healthResult.value);
    if (overviewResult.status === 'rejected') {
      const message = errorMessage(overviewResult.reason, 'Unable to load Super Admin overview.');
      setOverviewError(message);
      toastRef.current.error(message);
    }
    setOverviewLoading(false);
  }, []);

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

  const loadContacts = useCallback(async () => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      const data = await superAdminApi.getContactMessages({
        page: contactPage,
        limit: 20,
        ...(contactStatus ? { status: contactStatus } : {}),
        ...(contactCategory ? { category: contactCategory } : {}),
      });
      const items = listFrom(data, ['messages', 'items']);
      setContacts(items.map(normalizeContact));
      setContactPages(Number(data?.pagination?.pages ?? data?.totalPages ?? 1));
      setContactTotal(Number(data?.pagination?.total ?? data?.total ?? items.length));
    } catch (error) {
      const message = errorMessage(error, 'Unable to load contact messages.');
      setContactsError(message);
      setContacts([]);
      toastRef.current.error(message);
    } finally {
      setContactsLoading(false);
    }
  }, [contactCategory, contactPage, contactStatus]);

  useEffect(() => {
    const timer = window.setTimeout(loadOverview, 0);
    return () => window.clearTimeout(timer);
  }, [loadOverview]);

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  useEffect(() => {
    const timer = window.setTimeout(loadContacts, 0);
    return () => window.clearTimeout(timer);
  }, [loadContacts]);

  const visibleUsers = useMemo(
    () => users.filter((item) => !statusFilter || (statusFilter === 'active' ? item.isActive : !item.isActive)),
    [statusFilter, users],
  );

  const userRoleCounts = useMemo(() => normalizeRoleCounts(overview, users), [overview, users]);


  function canManage(target) {
    return target?._id && target.role !== 'super_admin' && target._id !== currentUserId;
  }

  function closeModal(force = false) {
    if (modalLoading && !force) return;
    setModal(null);
    setDeletionCheck(null);
    setDeletionReason('');
    setDeletionConfirmation('');
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
    setModalLoading(true);
    try {
      const data = await superAdminApi.checkUserDeletion(target._id);
      setDeletionCheck(data);
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to check deletion eligibility.'));
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

  async function updateContact(message) {
    const draft = contactDrafts[message._id] ?? { status: message.status, adminNotes: message.adminNotes };
    setModalLoading(true);
    try {
      await superAdminApi.updateContactStatus(message._id, draft);
      toast.success('Contact message updated successfully.');
      setContactDrafts((current) => ({ ...current, [message._id]: undefined }));
      loadContacts();
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to update this contact message.'));
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
  const overviewCases = overview?.cases ?? overview;
  const overviewUsers = overview?.users ?? overview;

  return (
    <div className="super-admin-page">
      <div className="super-admin-container">
        <header className="super-admin__header">
          <div>
            <p className="super-admin__eyebrow">GAVEL governance console</p>
            <h1 className="super-admin__title">Super Admin Overview</h1>
            <p className="super-admin__subtitle">Safeguard access, accountability, and the public record across the platform.</p>
          </div>
          <Button variant="primary" size="md" iconLeft={UserPlus} onClick={openInvite}>Create User</Button>
        </header>

        <section className="super-admin__quick-links" aria-label="Super Admin shortcuts">
          <Button variant="secondary" size="md" iconLeft={Users} onClick={() => document.getElementById('super-admin-users')?.scrollIntoView({ behavior: 'smooth' })}>Manage users</Button>
          <Button variant="secondary" size="md" iconLeft={Mail} onClick={() => document.getElementById('contact-inbox')?.scrollIntoView({ behavior: 'smooth' })}>Contact inbox</Button>
          <Button variant="secondary" size="md" iconLeft={ClipboardList} onClick={() => navigate('/cases')}>View cases</Button>
          <Button variant="secondary" size="md" iconLeft={Plus} onClick={() => navigate('/cases/new')}>Create case</Button>
        </section>

        {overviewLoading ? (
          <div className="super-admin__stats" aria-label="Loading overview">
            {Array.from({ length: 5 }).map((_, index) => <Card key={index} padding="lg"><Skeleton variant="card" height={88} /></Card>)}
          </div>
        ) : overviewError ? (
          <Card padding="lg" className="super-admin__error-card" role="alert">
            <XCircle size={20} aria-hidden="true" />
            <span>{overviewError}</span>
            <Button variant="secondary" size="sm" iconLeft={RefreshCw} onClick={loadOverview}>Try again</Button>
          </Card>
        ) : (
          <section className="super-admin__stats" aria-label="System overview">
            <SummaryCard icon={Users} label="Total users" value={countValue(overviewUsers, ['total', 'totalUsers', 'count'])} />
            <SummaryCard icon={ClipboardList} label="Total cases" value={countValue(overviewCases, ['total', 'totalCases'])} />
            <SummaryCard icon={Activity} label="Active cases" value={countValue(overviewCases, ['active', 'activeCases'])} />
            <SummaryCard icon={HeartHandshake} label="Pro-bono cases" value={countValue(overviewCases, ['proBono', 'proBonoCases'])} />
            <Card padding="lg" className="super-admin__roles-card">
              <div className="super-admin__stat-label"><Users size={18} aria-hidden="true" /> Users by role</div>
              <div className="super-admin__role-list">
                {Object.entries(userRoleCounts).filter(([role]) => ROLE_CONFIG[role]).map(([role, count]) => <span key={role}><strong>{Number(count).toLocaleString()}</strong> {displayRole(role)}</span>)}
              </div>
            </Card>
          </section>
        )}

        <section className="super-admin__insights" aria-label="System insights">
          <Card padding="lg">
            <div className="super-admin__section-heading"><div><p className="super-admin__eyebrow">Analytics</p><h2>Court and stage heatmap</h2></div><BarChart3 size={20} aria-hidden="true" /></div>
            {heatmap.length ? <div className="super-admin__mini-table"><table><thead><tr><th>Court</th><th>Stage</th><th>Cases</th></tr></thead><tbody>{heatmap.slice(0, 8).map((row, index) => <tr key={row._id ?? index}><td>{row.court ?? row._id?.court ?? 'Not provided'}</td><td>{row.stage ?? row._id?.stage ?? 'Not provided'}</td><td>{Number(row.count ?? row.total ?? 0).toLocaleString()}</td></tr>)}</tbody></table></div> : <p className="super-admin__muted">No heatmap data available.</p>}
          </Card>
          <Card padding="lg">
            <div className="super-admin__section-heading"><div><p className="super-admin__eyebrow">Trends</p><h2>Case status trends</h2></div><Activity size={20} aria-hidden="true" /></div>
            {trends.length ? <div className="super-admin__mini-table"><table><thead><tr><th>Period</th><th>Status</th><th>Changes</th></tr></thead><tbody>{trends.slice(-8).map((row, index) => <tr key={`${row.period}-${row.status}-${index}`}><td>{row.period}</td><td>{row.status}</td><td>{row.count.toLocaleString()}</td></tr>)}</tbody></table></div> : <p className="super-admin__muted">No trend data available.</p>}
          </Card>
          <Card padding="lg" className="super-admin__health-card">
            <div className="super-admin__section-heading"><div><p className="super-admin__eyebrow">System status</p><h2>Backend status</h2></div><ShieldCheck size={20} aria-hidden="true" /></div>
            <div className="super-admin__health-status"><span className={`super-admin__health-dot${health ? ' super-admin__health-dot--ok' : ''}`} aria-hidden="true" />{health ? 'Operational' : 'Status unavailable'}</div>
            <p className="super-admin__muted">Health is checked from the deployed API.</p>
          </Card>
        </section>

        <section id="super-admin-users" className="super-admin__section">
          <div className="super-admin__section-heading super-admin__section-heading--wide"><div><p className="super-admin__eyebrow">Access control</p><h2>User management</h2><p className="super-admin__muted">{userTotal.toLocaleString()} accounts across GAVEL.</p></div><Button variant="primary" size="md" iconLeft={UserPlus} onClick={openInvite}>Create User</Button></div>
          <Card padding="md">
            <div className="super-admin__filters" role="search">
              <label><span>Role</span><select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setUserPage(1); }}><option value="">All roles</option>{ROLE_FILTER_OPTIONS.map((role) => <option key={role} value={role}>{displayRole(role)}</option>)}</select></label>
              <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
              <Button variant="ghost" size="sm" iconLeft={RefreshCw} onClick={loadUsers}>Refresh</Button>
            </div>
            <DataTable columns={userColumns} data={visibleUsers} loading={usersLoading} error={usersError} rowIdKey="_id" emptyMessage="No users match the selected filters." pagination={userPages > 1 ? { page: userPage, totalPages: userPages, totalItems: userTotal, limit: 20, onPageChange: setUserPage } : null} />
            {!usersLoading && !usersError && <p className="super-admin__count-line" aria-live="polite">Showing {filteredUsersCount} user{filteredUsersCount === 1 ? '' : 's'} on this page.</p>}
          </Card>
        </section>

        <section id="contact-inbox" className="super-admin__section">
          <div className="super-admin__section-heading"><div><p className="super-admin__eyebrow">Public accountability</p><h2>Contact / report inbox</h2><p className="super-admin__muted">Review and resolve messages sent by public observers.</p></div><Mail size={20} aria-hidden="true" /></div>
          <Card padding="md">
            <div className="super-admin__filters">
              <label><span>Status</span><select value={contactStatus} onChange={(event) => { setContactStatus(event.target.value); setContactPage(1); }}><option value="">All statuses</option>{CONTACT_STATUSES.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select></label>
              <label><span>Category</span><select value={contactCategory} onChange={(event) => { setContactCategory(event.target.value); setContactPage(1); }}><option value="">All categories</option>{CONTACT_CATEGORIES.map((category) => <option key={category} value={category}>{labelFromToken(category)}</option>)}</select></label>
              <Button variant="ghost" size="sm" iconLeft={RefreshCw} onClick={loadContacts}>Refresh</Button>
            </div>
            {contactsError ? <div className="super-admin__inline-error" role="alert">{contactsError}</div> : <div className="super-admin__contact-list" aria-busy={contactsLoading}>{contactsLoading ? <Skeleton variant="card" height={160} /> : contacts.length === 0 ? <p className="super-admin__muted">No contact messages match these filters.</p> : contacts.map((message) => { const draft = contactDrafts[message._id] ?? { status: message.status, adminNotes: message.adminNotes }; return <article className="super-admin__contact-item" key={message._id}><div className="super-admin__contact-main"><div className="super-admin__contact-meta"><strong>{message.name}</strong><a href={`mailto:${message.email}`}>{message.email}</a><Badge tone={message.status === 'resolved' || message.status === 'closed' ? 'compliant' : message.status === 'in_review' ? 'warning' : 'neutral'}>{labelFromToken(message.status)}</Badge></div><p className="super-admin__contact-category">{labelFromToken(message.category)}</p><p className="super-admin__contact-message">{message.message}</p><p className="super-admin__muted">Received {formatDateTime(message.createdAt)} - Assigned: {message.assignedTo}</p></div><div className="super-admin__contact-actions"><label><span>Status</span><select value={draft.status} onChange={(event) => setContactDrafts((current) => ({ ...current, [message._id]: { ...draft, status: event.target.value } }))}>{CONTACT_STATUSES.map((status) => <option key={status} value={status}>{labelFromToken(status)}</option>)}</select></label><label><span>Admin notes</span><textarea rows={2} value={draft.adminNotes} onChange={(event) => setContactDrafts((current) => ({ ...current, [message._id]: { ...draft, adminNotes: event.target.value } }))} placeholder="Optional note" /></label><Button variant="secondary" size="sm" onClick={() => updateContact(message)} loading={modalLoading}>Save update</Button></div></article>; })}</div>}
            {!contactsLoading && !contactsError && contactTotal > 0 && <div className="super-admin__pagination-line"><span>{contactTotal.toLocaleString()} message{contactTotal === 1 ? '' : 's'}</span><div><Button variant="ghost" size="sm" disabled={contactPage <= 1} onClick={() => setContactPage((page) => page - 1)}>Previous</Button><span>Page {contactPage} of {contactPages}</span><Button variant="ghost" size="sm" disabled={contactPage >= contactPages} onClick={() => setContactPage((page) => page + 1)}>Next</Button></div></div>}
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
        <form className="super-admin__form" onSubmit={handleDelete}><p>This action permanently removes <strong>{modal?.user?.firstName} {modal?.user?.lastName}</strong> and cannot be undone.</p>{modalLoading && !deletionCheck ? <Skeleton variant="card" height={120} /> : deletionCheck && <><dl className="super-admin__identity-list"><div><dt>Email</dt><dd>{modal?.user?.email}</dd></div><div><dt>Role</dt><dd>{displayRole(modal?.user?.role)}</dd></div><div><dt>Allowed</dt><dd><Badge tone={deletionCheck.canDelete ? 'compliant' : 'critical'}>{deletionCheck.canDelete ? 'Yes' : 'No'}</Badge></dd></div></dl>{!deletionCheck.canDelete && <div className="super-admin__warning"><FileWarning size={18} aria-hidden="true" /><span>Records must be reassigned or removed first. Non-zero dependencies are listed below.</span></div>}<div className="super-admin__dependency-grid">{Object.entries(deletionCheck.dependencies ?? {}).filter(([, count]) => Number(count) > 0).map(([key, count]) => <span key={key}><strong>{count}</strong> {key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>)}{Object.values(deletionCheck.dependencies ?? {}).every((count) => Number(count) === 0) && <span>No operational dependencies found.</span>}</div>{deletionCheck.canDelete && <><label className="super-admin__field"><span>Deletion reason</span><textarea rows={3} maxLength={500} value={deletionReason} onChange={(event) => setDeletionReason(event.target.value)} disabled={modalLoading} required /></label><label className="super-admin__field"><span>Type <strong>{deletionCheck.requiredConfirmation}</strong> to confirm</span><input value={deletionConfirmation} onChange={(event) => setDeletionConfirmation(event.target.value)} disabled={modalLoading} required /></label><FormActions onCancel={closeModal} loading={modalLoading} submitLabel="Delete permanently" danger disabled={deletionConfirmation !== deletionCheck.requiredConfirmation || deletionReason.trim().length < 10} /></>}</>}</form>
      </Modal>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return <Card padding="lg"><div className="super-admin__stat-label"><Icon size={18} aria-hidden="true" /> {label}</div><strong className="super-admin__stat-value">{Number(value).toLocaleString()}</strong></Card>;
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
