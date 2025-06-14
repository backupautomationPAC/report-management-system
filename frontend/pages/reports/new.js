import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getStoredUser, clearStoredAuth } from '../../utils/auth';
import { reportsAPI } from '../../utils/api';

export default function NewReport() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    client_name: '',
    report_period: '',
    start_date: '',
    end_date: '',
    content: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const storedUser = getStoredUser();
    setUser(storedUser);

    // Auto-fill current month
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
    const firstDay = `${currentMonth}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    setFormData(prev => ({
      ...prev,
      report_period: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      start_date: firstDay,
      end_date: lastDay
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reportData = {
        ...formData,
        content: formData.content || `Sample report content for ${formData.client_name} covering the period ${formData.report_period}.`
      };

      const newReport = await reportsAPI.create(reportData);
      setSuccess(`Report created successfully! Report ID: ${newReport.id}`);

      // Redirect to the new report after a short delay
      setTimeout(() => {
        router.push(`/reports/${newReport.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating report:', error);
      if (error.response?.status === 401) {
        clearStoredAuth();
        router.push('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to create report');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    router.push('/login');
  };

  const commonClients = [
    'BESH RESTAURANT GROUP',
    'OCHSNER HEALTH',
    'TULANE UNIVERSITY',
    'NEW ORLEANS TOURISM',
    'LOUISIANA ECONOMIC DEVELOPMENT'
  ];

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
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: '#2d3748' }}>Create New Report</h1>
          <button 
            onClick={() => router.push('/reports')}
            className="btn btn-secondary"
          >
            ← Back to Reports
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Form */}
        <div className="card">
          <div className="card-title">Report Details</div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="client_name" className="form-label">
                  Client Name *
                </label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  className="form-input"
                  value={formData.client_name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Enter client name"
                  list="client-suggestions"
                />
                <datalist id="client-suggestions">
                  {commonClients.map(client => (
                    <option key={client} value={client} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label htmlFor="report_period" className="form-label">
                  Report Period *
                </label>
                <input
                  type="text"
                  id="report_period"
                  name="report_period"
                  className="form-input"
                  value={formData.report_period}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="e.g., December 2024"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date" className="form-label">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  className="form-input"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date" className="form-label">
                  End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  className="form-input"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Report Content
              </label>
              <textarea
                id="content"
                name="content"
                className="form-input"
                value={formData.content}
                onChange={handleInputChange}
                disabled={loading}
                rows="8"
                placeholder="Enter report content or leave blank for auto-generated content..."
                style={{ minHeight: '200px', resize: 'vertical' }}
              />
              <small style={{ color: '#718096', fontSize: '14px' }}>
                Leave blank to auto-generate sample content based on client name and period.
              </small>
            </div>

            <div className="form-actions">
              <button 
                type="button"
                onClick={() => router.push('/reports')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.client_name || !formData.report_period}
              >
                {loading ? 'Creating Report...' : 'Create Report'}
              </button>
            </div>
          </form>
        </div>

        {/* Helper Info */}
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-title">💡 Tips</div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#4a5568' }}>
            <li>Client name and report period are required fields</li>
            <li>Start and end dates help organize your reports chronologically</li>
            <li>Report content can be added now or edited later</li>
            <li>New reports are created in "draft" status</li>
            <li>You can edit draft reports before submitting for review</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
