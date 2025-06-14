import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getStoredUser, clearStoredAuth } from '../../utils/auth';
import { reportsAPI } from '../../utils/api';

export default function Reports() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthAndLoadReports();
  }, []);

  const checkAuthAndLoadReports = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      const storedUser = getStoredUser();
      setUser(storedUser);

      const reportsData = await reportsAPI.getAll();
      setReports(reportsData.reports || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      if (error.response?.status === 401) {
        clearStoredAuth();
        router.push('/login');
      } else {
        setError('Failed to load reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
          <h1 style={{ margin: 0, color: '#2d3748' }}>All Reports</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => router.push('/')}
              className="btn btn-secondary"
            >
              ← Back to Dashboard
            </button>
            <button 
              onClick={() => router.push('/reports/new')}
              className="btn btn-primary"
            >
              Create New Report
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client Name</th>
                  <th>Report Period</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Submitted By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      <div>
                        <p style={{ marginBottom: '20px', color: '#718096' }}>
                          No reports found.
                        </p>
                        <button 
                          onClick={() => router.push('/reports/new')}
                          className="btn btn-primary"
                        >
                          Create Your First Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id}>
                      <td>#{report.id}</td>
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
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            onClick={() => router.push(`/reports/${report.id}`)}
                            className="btn btn-sm btn-secondary"
                          >
                            View
                          </button>
                          {report.status === 'draft' && (
                            <button 
                              onClick={() => router.push(`/reports/${report.id}/edit`)}
                              className="btn btn-sm btn-primary"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        {reports.length > 0 && (
          <div className="stats-grid" style={{ marginTop: '30px' }}>
            <div className="stat-card">
              <div className="stat-number">{reports.length}</div>
              <div className="stat-label">Total Reports</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {reports.filter(r => r.status === 'draft').length}
              </div>
              <div className="stat-label">Draft</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {reports.filter(r => ['pending_ae', 'pending_supervisor', 'pending_accounting'].includes(r.status)).length}
              </div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {reports.filter(r => r.status === 'approved').length}
              </div>
              <div className="stat-label">Approved</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
