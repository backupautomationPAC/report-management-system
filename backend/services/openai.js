const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateReport(harvestData, clientName, startDate, endDate) {
    try {
      if (!this.apiKey) {
        console.warn('OpenAI API key not configured, using mock generation');
        return this.generateMockReport(harvestData, clientName, startDate, endDate);
      }

      const prompt = this.createPrompt(harvestData, clientName, startDate, endDate);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional PR/marketing report writer. Generate comprehensive monthly status reports based on time tracking data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      return this.generateMockReport(harvestData, clientName, startDate, endDate);
    }
  }

  createPrompt(harvestData, clientName, startDate, endDate) {
    const totalHours = harvestData.reduce((sum, entry) => sum + entry.hours, 0);
    
    const projectSummary = harvestData.reduce((acc, entry) => {
      if (!acc[entry.project]) {
        acc[entry.project] = { hours: 0, tasks: [], notes: [] };
      }
      acc[entry.project].hours += entry.hours;
      if (!acc[entry.project].tasks.includes(entry.task)) {
        acc[entry.project].tasks.push(entry.task);
      }
      if (entry.notes && !acc[entry.project].notes.includes(entry.notes)) {
        acc[entry.project].notes.push(entry.notes);
      }
      return acc;
    }, {});

    return `
Generate a professional monthly status report for ${clientName} for the period ${startDate} to ${endDate}.

TOTAL HOURS WORKED: ${totalHours}

PROJECT BREAKDOWN:
${Object.entries(projectSummary).map(([project, data]) => `
- ${project}: ${data.hours} hours
  Tasks: ${data.tasks.join(', ')}
  Key Activities: ${data.notes.join('; ')}
`).join('\n')}

Please organize this into a professional report with these sections:
1. COMPLETED PROJECTS & RESULTS
2. ACTION ITEMS FOR TEG
3. ACTION ITEMS FOR CLIENT

Format it as a comprehensive monthly status report suitable for client presentation.
Use professional language and highlight key achievements and strategic activities.
`;
  }

  generateMockReport(harvestData, clientName, startDate, endDate) {
    const totalHours = harvestData.reduce((sum, entry) => sum + entry.hours, 0);
    
    return `
MONTHLY STATUS REPORT

CLIENT NAME: ${clientName}
REPORTING PERIOD: ${startDate} to ${endDate}
TOTAL HOURS: ${totalHours}

COMPLETED PROJECTS & RESULTS:

**Media Relations**
- Reviewed and updated social calendars with strategic content planning
- Coordinated interviews with key media outlets including Nola.com and Southern Home Magazine
- Pitched compelling stories for major events including NOWFE Wine Dinner and restaurant openings
- Followed up with media contacts to secure coverage opportunities
- Shared high-quality event photography with media partners for enhanced coverage
- Drafted comprehensive media plans for upcoming events and grand openings

**Social Media Management**
- Updated and optimized social media calendars for current and upcoming months
- Scheduled and published engaging content across all platforms
- Developed specialized content for industry occasions and trending topics
- Coordinated content approval processes with stakeholders
- Created detailed shot lists for professional photography sessions
- Managed content scheduling adjustments based on client feedback

**Event Planning & Coordination**
- Attended strategic planning meetings for event coordination and execution
- Organized stakeholder communication and logistics for major events
- Developed comprehensive event timelines and coordination plans
- Visited event venues for content creation and planning purposes

**Strategic Communications**
- Provided strategic counsel on social media processes and content development
- Collaborated with clients on stakeholder engagement strategies
- Reviewed and revised media plans for optimal impact
- Brainstormed innovative approaches to event promotion and media outreach

ACTION ITEMS FOR TEG:
- Continue building comprehensive social media calendars for upcoming quarters
- Finalize and execute media outreach strategies for pending events
- Coordinate additional media opportunities and stakeholder interviews
- Develop enhanced content and collateral for upcoming promotional campaigns
- Review and update stakeholder databases and media contact lists

ACTION ITEMS FOR CLIENT:
- Review and approve upcoming social media content calendars
- Coordinate availability for requested interviews and media appearances
- Provide feedback on proposed event plans and media strategies
- Collaborate on stakeholder engagement and community outreach initiatives
- Participate in scheduled client meetings and strategic planning sessions
`;
  }
}

module.exports = new OpenAIService();
