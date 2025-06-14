const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';

    if (!this.apiKey) {
      console.warn('OpenAI API key not configured');
    }
  }

  async generateReportContent(timeEntries, clientName, startDate, endDate) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const formattedData = this.formatTimeEntriesForPrompt(timeEntries);
      const prompt = this.createReportPrompt(formattedData, clientName, startDate, endDate);

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional report writer for a PR agency. Generate detailed monthly status reports based on time tracking data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      throw new Error(`Failed to generate report content: ${error.message}`);
    }
  }

  formatTimeEntriesForPrompt(timeEntries) {
    const groupedData = {};

    timeEntries.forEach(entry => {
      const projectKey = entry.project ? entry.project.name : 'Unknown Project';
      const taskKey = entry.task ? entry.task.name : 'Unknown Task';

      if (!groupedData[projectKey]) {
        groupedData[projectKey] = {};
      }

      if (!groupedData[projectKey][taskKey]) {
        groupedData[projectKey][taskKey] = {
          hours: 0,
          notes: []
        };
      }

      groupedData[projectKey][taskKey].hours += entry.hours;
      if (entry.notes && entry.notes.trim()) {
        groupedData[projectKey][taskKey].notes.push(entry.notes.trim());
      }
    });

    let formatted = '';
    Object.keys(groupedData).forEach(project => {
      formatted += `\n**${project}:**\n`;
      Object.keys(groupedData[project]).forEach(task => {
        const data = groupedData[project][task];
        formatted += `  - ${task}: ${data.hours} hours\n`;
        if (data.notes.length > 0) {
          formatted += `    Notes: ${data.notes.join('; ')}\n`;
        }
      });
    });

    return formatted;
  }

  createReportPrompt(formattedData, clientName, startDate, endDate) {
    return `Generate a professional monthly status report for ${clientName} based on the following time tracking data from ${startDate} to ${endDate}:

${formattedData}

Please organize the report into these sections:
1. **Completed Projects & Results** - Describe the work completed based on the time entries and notes
2. **Action Items for TEG** - List follow-up actions for the agency team
3. **Action Items for Client** - List actions required from the client

Use a professional tone and expand on the time entries to create meaningful descriptions of the work performed. Make it sound like a comprehensive PR agency status report.`;
  }

  async summarizeContent(content, maxLength = 500) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      if (content.length <= maxLength) {
        return content;
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional editor. Summarize the following content while maintaining its professional tone and key information.'
            },
            {
              role: 'user',
              content: `Please summarize this content to approximately ${maxLength} characters:\n\n${content}`
            }
          ],
          max_tokens: Math.ceil(maxLength / 3),
          temperature: 0.5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      return content.substring(0, maxLength) + '...';
    }
  }
}

module.exports = new OpenAIService();
