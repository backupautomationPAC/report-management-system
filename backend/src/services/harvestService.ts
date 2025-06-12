import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface HarvestTimeEntry {
  id: number;
  spent_date: string;
  hours: number;
  notes: string;
  client: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    name: string;
  };
  task: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
}

export interface HarvestClient {
  id: number;
  name: string;
  is_active: boolean;
}

export interface HarvestProject {
  id: number;
  name: string;
  client: {
    id: number;
    name: string;
  };
  is_active: boolean;
}

class HarvestService {
  private baseURL = 'https://api.harvestapp.com';
  private accessToken: string;
  private accountId: string;

  constructor() {
    this.accessToken = process.env.HARVEST_ACCESS_TOKEN!;
    this.accountId = process.env.HARVEST_ACCOUNT_ID!;

    if (!this.accessToken || !this.accountId) {
      throw new Error('Harvest API credentials not configured');
    }
  }

  private getHeaders() {
    return {
      'Harvest-Account-ID': this.accountId,
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async getClients(): Promise<HarvestClient[]> {
    try {
      const response = await axios.get(`${this.baseURL}/v2/clients`, {
        headers: this.getHeaders(),
      });
      return response.data.clients;
    } catch (error: any) {
      console.error('Error fetching Harvest clients:', error.response?.data || error.message);
      throw new Error('Failed to fetch Harvest clients');
    }
  }

  async getProjects(): Promise<HarvestProject[]> {
    try {
      const response = await axios.get(`${this.baseURL}/v2/projects`, {
        headers: this.getHeaders(),
      });
      return response.data.projects;
    } catch (error: any) {
      console.error('Error fetching Harvest projects:', error.response?.data || error.message);
      throw new Error('Failed to fetch Harvest projects');
    }
  }

  async getTimeEntries(
    from: string,
    to: string,
    clientId?: string,
    projectId?: string
  ): Promise<HarvestTimeEntry[]> {
    try {
      const params: any = { from, to };
      if (clientId) params.client_id = clientId;
      if (projectId) params.project_id = projectId;

      const response = await axios.get(`${this.baseURL}/v2/time_entries`, {
        headers: this.getHeaders(),
        params,
      });

      return response.data.time_entries;
    } catch (error: any) {
      console.error('Error fetching Harvest time entries:', error.response?.data || error.message);
      throw new Error('Failed to fetch Harvest time entries');
    }
  }

  async cacheTimeEntries(
    from: string,
    to: string,
    reportId?: string
  ): Promise<void> {
    try {
      const timeEntries = await this.getTimeEntries(from, to);

      // Clear existing cache for this date range
      await prisma.harvestEntry.deleteMany({
        where: {
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
          reportId,
        },
      });

      // Insert new entries
      const harvestEntries = timeEntries.map(entry => ({
        reportId,
        clientName: entry.client.name,
        projectName: entry.project.name,
        taskName: entry.task.name,
        hours: entry.hours,
        date: new Date(entry.spent_date),
        notes: entry.notes,
        userName: entry.user.name,
      }));

      await prisma.harvestEntry.createMany({
        data: harvestEntries,
      });
    } catch (error: any) {
      console.error('Error caching Harvest time entries:', error);
      throw error;
    }
  }

  async getTimeEntriesByClient(
    clientName: string,
    from: string,
    to: string
  ): Promise<HarvestTimeEntry[]> {
    try {
      const allEntries = await this.getTimeEntries(from, to);
      return allEntries.filter(entry => 
        entry.client.name.toLowerCase().includes(clientName.toLowerCase())
      );
    } catch (error: any) {
      console.error('Error fetching time entries by client:', error);
      throw error;
    }
  }
}

export default new HarvestService();
