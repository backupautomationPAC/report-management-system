const axios = require('axios');

class HarvestService {
  constructor() {
    this.baseURL = 'https://api.harvestapp.com/v2';
    this.token = process.env.HARVEST_TOKEN;
    this.accountId = process.env.HARVEST_ACCOUNT_ID;

    if (!this.token || !this.accountId) {
      console.warn('Harvest API credentials not configured');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Harvest-Account-ID': this.accountId,
      'Content-Type': 'application/json'
    };
  }

  async getTimeEntries(startDate, endDate, clientName = null) {
    try {
      if (!this.token || !this.accountId) {
        throw new Error('Harvest API credentials not configured');
      }

      const params = {
        from: startDate,
        to: endDate
      };

      if (clientName) {
        // First get client ID by name
        const clients = await this.getClients();
        const client = clients.find(c => c.name.toLowerCase().includes(clientName.toLowerCase()));
        if (client) {
          params.client_id = client.id;
        }
      }

      const response = await axios.get(`${this.baseURL}/time_entries`, {
        headers: this.getHeaders(),
        params
      });

      return response.data.time_entries || [];
    } catch (error) {
      console.error('Harvest API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch time entries from Harvest');
    }
  }

  async getClients() {
    try {
      if (!this.token || !this.accountId) {
        throw new Error('Harvest API credentials not configured');
      }

      const response = await axios.get(`${this.baseURL}/clients`, {
        headers: this.getHeaders()
      });

      return response.data.clients || [];
    } catch (error) {
      console.error('Harvest API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch clients from Harvest');
    }
  }

  async getProjects(clientId = null) {
    try {
      if (!this.token || !this.accountId) {
        throw new Error('Harvest API credentials not configured');
      }

      const params = {};
      if (clientId) {
        params.client_id = clientId;
      }

      const response = await axios.get(`${this.baseURL}/projects`, {
        headers: this.getHeaders(),
        params
      });

      return response.data.projects || [];
    } catch (error) {
      console.error('Harvest API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch projects from Harvest');
    }
  }

  formatTimeEntriesForReport(timeEntries) {
    if (!Array.isArray(timeEntries)) {
      return [];
    }

    return timeEntries.map(entry => ({
      date: entry.spent_date,
      project: entry.project?.name || 'Unknown Project',
      task: entry.task?.name || 'Unknown Task',
      hours: entry.hours || 0,
      notes: entry.notes || '',
      user: entry.user?.name || 'Unknown User'
    }));
  }

  groupTimeEntriesByProject(timeEntries) {
    const grouped = {};

    timeEntries.forEach(entry => {
      const projectName = entry.project?.name || 'Unknown Project';

      if (!grouped[projectName]) {
        grouped[projectName] = {
          totalHours: 0,
          tasks: {},
          entries: []
        };
      }

      grouped[projectName].totalHours += entry.hours || 0;
      grouped[projectName].entries.push(entry);

      const taskName = entry.task?.name || 'Unknown Task';
      if (!grouped[projectName].tasks[taskName]) {
        grouped[projectName].tasks[taskName] = 0;
      }
      grouped[projectName].tasks[taskName] += entry.hours || 0;
    });

    return grouped;
  }
}

module.exports = HarvestService;
