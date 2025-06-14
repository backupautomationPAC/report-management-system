const axios = require('axios');

class HarvestService {
  constructor() {
    this.baseURL = 'https://api.harvestapp.com/v2';
    this.token = process.env.HARVEST_TOKEN;
    this.accountId = process.env.HARVEST_ACCOUNT_ID;

    if (!this.token || !this.accountId) {
      console.warn('Harvest credentials not configured');
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

      const response = await axios.get(`${this.baseURL}/time_entries`, {
        headers: this.getHeaders(),
        params
      });

      let timeEntries = response.data.time_entries || [];

      // Filter by client name if provided
      if (clientName) {
        timeEntries = timeEntries.filter(entry => 
          entry.client && entry.client.name.toLowerCase().includes(clientName.toLowerCase())
        );
      }

      return timeEntries.map(entry => ({
        id: entry.id,
        spentDate: entry.spent_date,
        hours: entry.hours,
        notes: entry.notes || '',
        client: entry.client ? {
          id: entry.client.id,
          name: entry.client.name
        } : null,
        project: entry.project ? {
          id: entry.project.id,
          name: entry.project.name
        } : null,
        task: entry.task ? {
          id: entry.task.id,
          name: entry.task.name
        } : null,
        user: entry.user ? {
          id: entry.user.id,
          name: entry.user.name
        } : null
      }));
    } catch (error) {
      console.error('Harvest API error:', error.message);
      throw new Error(`Failed to fetch time entries: ${error.message}`);
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

      const clients = response.data.clients || [];

      return clients.map(client => ({
        id: client.id,
        name: client.name,
        active: client.is_active
      }));
    } catch (error) {
      console.error('Harvest API error:', error.message);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }
  }

  async getProjects(clientId = null) {
    try {
      if (!this.token || !this.accountId) {
        throw new Error('Harvest API credentials not configured');
      }

      const params = clientId ? { client_id: clientId } : {};

      const response = await axios.get(`${this.baseURL}/projects`, {
        headers: this.getHeaders(),
        params
      });

      const projects = response.data.projects || [];

      return projects.map(project => ({
        id: project.id,
        name: project.name,
        code: project.code,
        active: project.is_active,
        client: project.client ? {
          id: project.client.id,
          name: project.client.name
        } : null
      }));
    } catch (error) {
      console.error('Harvest API error:', error.message);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }
}

module.exports = new HarvestService();
