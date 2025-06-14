import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getStoredUser, clearStoredAuth } from '../../utils/auth';
import { reportsAPI } from '../../utils/api';

export default function ReportView() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const storedUser = getStoredUser();
    setUser(storedUser);

    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      const reportData = await reportsAPI.getById(id);
      setReport(reportData);
    } catch (error) {
      console.error('Error loading report:', error);
      if (error.response?.status === 401) {
        clearStoredAuth();
        router.push('/login');
      } else if (error.response?.status === 404) {
        setError('Report not found');
      } else {
        setError('Failed to load report');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const updatedReport = await reportsAPI.updateStatus(id, newStatus);
      setReport(updatedReport);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update report status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canApprove = (status) => {
    if (!user) return false;

    const approvalFlow = {
      'draft': user.role === 'ae' || user.role === 'admin',
      'pending_ae': user.role === 'ae' || user.role === 'admin',
      'pending_supervisor': user.role === 'supervisor' || user.role === 'admin',
      'pending_accounting': user.role === 'accounting' || user.role === 'admin'
    };

    return approvalFlow[status] || false;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'draft': 'pending_ae',
      'pending_ae': 'pending_supervisor',
      'pending_supervisor': 'pending_accounting',
      'pending_accounting': 'approved'
    };
    return statusFlow[currentStatus];
  };

  const handleLogout = () => {
    clearStoredAuth();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="alert alert-error">
            {error}
          </div>
          <button 
            onClick={() => router.push('/reports')}
            className="btn btn-secondary"
          >
            ← Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <div className="navbar-brand">
              <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                Report Management System
              </a>
            </div>
            <div className="navbar-user">
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: '#2d3748' }}>
            Report #{report?.id} - {report?.client_name}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => router.push('/reports')}
              className="btn btn-secondary"
            >
              ← Back to Reports
            </button>
            {report?.status === 'draft' && (
              <button 
                onClick={() => router.push(`/reports/${id}/edit`)}
                className="btn btn-primary"
              >
                Edit Report
              </button>
            )}
          </div>
        </div>

        {/* Report Details */}
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-title">Report Information</div>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <strong>Client:</strong> {report?.client_name}
              </div>
              <div>
                <strong>Report Period:</strong> {report?.report_period}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={getStatusBadgeClass(report?.status)}>
                  {report?.status?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <strong>Created:</strong> {formatDate(report?.created_at)}
              </div>
              <div>
                <strong>Submitted By:</strong> {report?.submitted_by}
              </div>
              {report?.start_date && (
                <div>
                  <strong>Period:</strong> {formatDate(report?.start_date)} - {formatDate(report?.end_date)}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {canApprove(report?.status) && report?.status !== 'approved' && (
                <>
                  <button 
                    onClick={() => handleStatusUpdate(getNextStatus(report?.status))}
                    className="btn btn-success"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : `Approve (${getNextStatus(report?.status)?.replace('_', ' ')})`}
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('rejected')}
                    className="btn btn-danger"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Reject'}
                  </button>
                </>
              )}
              {report?.status === 'approved' && (
                <div className="alert alert-success">
                  ✅ This report has been approved!
                </div>
              )}
              {report?.status === 'rejected' && (
                <div className="alert alert-error">
                  ❌ This report has been rejected.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="card">
          <div className="card-title">Report Content</div>
          <div style={{ 
            padding: '20px', 
            background: '#f7fafc', 
            borderRadius: '8px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {report?.content || 'No content available.'}
          </div>
        </div>

        {/* Approval History */}
        <div className="card">
          <div className="card-title">Approval History</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Approved By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Account Executive</td>
                  <td>
                    {report?.ae_approved_by ? (
                      <span className="status-badge status-approved">Approved</span>
                    ) : (
                      <span className="status-badge status-draft">Pending</span>
                    )}
                  </td>
                  <td>{report?.ae_approved_by || '-'}</td>
                  <td>{report?.ae_approved_at ? formatDate(report.ae_approved_at) : '-'}</td>
                </tr>
                <tr>
                  <td>Supervisor</td>
                  <td>
                    {report?.supervisor_approved_by ? (
                      <span className="status-badge status-approved">Approved</span>
                    ) : (
                      <span className="status-badge status-draft">Pending</span>
                    )}
                  </td>
                  <td>{report?.supervisor_approved_by || '-'}</td>
                  <td>{report?.supervisor_approved_at ? formatDate(report.supervisor_approved_at) : '-'}</td>
                </tr>
                <tr>
                  <td>Accounting</td>
                  <td>
                    {report?.accounting_approved_by ? (
                      <span className="status-badge status-approved">Approved</span>
                    ) : (
                      <span className="status-badge status-draft">Pending</span>
                    )}
                  </td>
                  <td>{report?.accounting_approved_by || '-'}</td>
                  <td>{report?.accounting_approved_at ? formatDate(report.accounting_approved_at) : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
