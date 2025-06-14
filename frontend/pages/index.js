import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getStoredUser, clearStoredAuth } from '../utils/auth';
import { authAPI, reportsAPI, healthCheck } from '../utils/api';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkAuth();
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await healthCheck();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
      setError('Cannot connect to backend server');
    }
  };

  const checkAuth = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      const storedUser = getStoredUser();
      setUser(storedUser);

      // Load reports
      const reportsData = await reportsAPI.getAll();
      setReports(reportsData.reports || []);
    } catch (error) {
      console.error('Auth check failed:', error);
      clearStoredAuth();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredAuth();
      router.push('/login');
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
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
              Report Management System
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
        {/* Backend Status */}
        {backendStatus === 'disconnected' && (
          <div className="alert alert-error">
            ⚠️ Backend Connection Error: {error}
          </div>
        )}

        {backendStatus === 'connected' && (
          <div className="alert alert-success">
            ✅ Connected to Railway backend successfully!
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{reports.length}</div>
            <div className="stat-label">Total Reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reports.filter(r => r.status === 'draft').length}
            </div>
            <div className="stat-label">Draft Reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reports.filter(r => r.status === 'approved').length}
            </div>
            <div className="stat-label">Approved Reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reports.filter(r => ['pending_ae', 'pending_supervisor', 'pending_accounting'].includes(r.status)).length}
            </div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="card-title">Recent Reports</div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Report Period</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Submitted By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      No reports found. Create your first report!
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.client_name}</td>
                      <td>{report.report_period}</td>
                      <td>
                        <span className={getStatusBadgeClass(report.status)}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{formatDate(report.created_at)}</td>
                      <td>{report.submitted_by}</td>
                      <td>
                        <button 
                          onClick={() => router.push(`/reports/${report.id}`)}
                          className="btn btn-sm btn-secondary"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => router.push('/reports/new')}
                className="btn btn-primary"
              >
                Create New Report
              </button>
              <button 
                onClick={() => router.push('/reports')}
                className="btn btn-secondary"
              >
                View All Reports
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => router.push('/users')}
                  className="btn btn-secondary"
                >
                  Manage Users
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">System Info</div>
            <p><strong>Backend Status:</strong> {backendStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}</p>
            <p><strong>User Role:</strong> {user?.role}</p>
            <p><strong>Login Status:</strong> ✅ Authenticated</p>
            <p><strong>Session:</strong> Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
