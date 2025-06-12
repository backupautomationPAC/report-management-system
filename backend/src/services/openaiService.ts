import OpenAI from 'openai';

export interface ReportGenerationRequest {
  clientName: string;
  reportPeriod: string;
  harvestData: Array<{
    projectName: string;
    taskName: string;
    hours: number;
    date: string;
    notes?: string;
    userName: string;
  }>;
}

class OpenAIService {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateReportContent(request: ReportGenerationRequest): Promise<string> {
    try {
      const { clientName, reportPeriod, harvestData } = request;

      // Group data by project and task
      const groupedData = this.groupHarvestData(harvestData);

      // Create prompt for AI
      const prompt = this.createReportPrompt(clientName, reportPeriod, groupedData);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional report writer specializing in client status reports. Generate comprehensive, well-structured monthly reports based on time tracking data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Unable to generate report content';
    } catch (error: any) {
      console.error('Error generating report with OpenAI:', error);
      throw new Error('Failed to generate report content');
    }
  }

  private groupHarvestData(harvestData: ReportGenerationRequest['harvestData']) {
    const grouped: { [key: string]: any } = {};

    harvestData.forEach(entry => {
      const key = `${entry.projectName} - ${entry.taskName}`;
      if (!grouped[key]) {
        grouped[key] = {
          projectName: entry.projectName,
          taskName: entry.taskName,
          totalHours: 0,
          entries: [],
        };
      }
      grouped[key].totalHours += entry.hours;
      grouped[key].entries.push(entry);
    });

    return Object.values(grouped);
  }

  private createReportPrompt(
    clientName: string,
    reportPeriod: string,
    groupedData: any[]
  ): string {
    const dataSection = groupedData.map(group => {
      const { projectName, taskName, totalHours, entries } = group;
      const notesList = entries
        .filter((entry: any) => entry.notes)
        .map((entry: any) => `- ${entry.notes}`)
        .join('\n');

      return `Project: ${projectName}
Task: ${taskName}
Total Hours: ${totalHours}
Details:
${notesList || '- No specific notes recorded'}`;
    }).join('\n\n');

    return `Generate a professional monthly status report for ${clientName} for the period ${reportPeriod}.

Based on the following time tracking data:

${dataSection}

Please structure the report with these sections:
1. **Completed Projects & Results**: Summarize the work completed, organized by project/task with key achievements and deliverables
2. **Action Items for TEG**: List any follow-up actions or next steps for our team
3. **Action Items for Client**: List any actions required from the client

Guidelines:
- Use professional, client-friendly language
- Focus on business value and outcomes
- Be specific about deliverables and achievements
- Keep it concise but comprehensive
- Group related activities together
- Highlight key accomplishments and milestones

Format the output as clean text with proper headings and bullet points.`;
  }

  async summarizeProjectWork(
    projectName: string,
    tasks: Array<{ taskName: string; hours: number; notes?: string }>
  ): Promise<string> {
    try {
      const tasksDescription = tasks.map(task => 
        `${task.taskName} (${task.hours} hours)${task.notes ? ': ' + task.notes : ''}`
      ).join('\n');

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional project manager. Summarize project work in a clear, client-friendly manner.'
          },
          {
            role: 'user',
            content: `Summarize the work completed for project "${projectName}" based on these tasks:\n\n${tasksDescription}\n\nProvide a brief, professional summary highlighting key accomplishments and outcomes.`
          }
        ],
        max_tokens: 300,
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content || 'Work completed as tracked';
    } catch (error: any) {
      console.error('Error summarizing project work:', error);
      return 'Work completed as tracked in time entries';
    }
  }
}

export default new OpenAIService();
