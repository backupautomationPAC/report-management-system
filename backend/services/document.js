const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell } = require('docx');
const fs = require('fs').promises;
const path = require('path');

class DocumentService {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'uploads', 'reports');
    this.ensureOutputDirectory();
  }

  async ensureOutputDirectory() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  async generateDocument(content, clientName, startDate, endDate) {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: "MONTHLY STATUS REPORT",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // Client info
            new Paragraph({
              children: [
                new TextRun({
                  text: "CLIENT NAME: ",
                  bold: true
                }),
                new TextRun({
                  text: clientName.toUpperCase()
                })
              ],
              spacing: { after: 200 }
            }),

            // Report period
            new Paragraph({
              children: [
                new TextRun({
                  text: "REPORTING PERIOD: ",
                  bold: true
                }),
                new TextRun({
                  text: this.formatReportPeriod(startDate, endDate)
                })
              ],
              spacing: { after: 400 }
            }),

            // Content
            ...this.parseContentToParagraphs(content)
          ]
        }]
      });

      const fileName = `${clientName.replace(/[^a-z0-9]/gi, '_')}_Report_${this.formatDateForFileName(startDate)}.docx`;
      const filePath = path.join(this.outputDir, fileName);

      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(filePath, buffer);

      return filePath;
    } catch (error) {
      console.error('Document generation error:', error);
      throw new Error('Failed to generate document');
    }
  }

  parseContentToParagraphs(content) {
    if (!content) return [];

    const lines = content.split('\n');
    const paragraphs = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Handle headings (lines starting with # or **)
      if (trimmedLine.startsWith('# ')) {
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }));
      } else if (trimmedLine.startsWith('## ')) {
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 }
        }));
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        // Bold headings
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.slice(2, -2),
              bold: true,
              size: 24
            })
          ],
          spacing: { before: 300, after: 200 }
        }));
      } else if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
        // Bullet points
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(2),
          bullet: { level: 0 },
          spacing: { after: 100 }
        }));
      } else {
        // Regular paragraphs
        paragraphs.push(new Paragraph({
          text: trimmedLine,
          spacing: { after: 200 }
        }));
      }
    });

    return paragraphs;
  }

  formatReportPeriod(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return start.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    }

    return `${start.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  }

  formatDateForFileName(date) {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    }).replace(' ', '_');
  }

  createTable(data) {
    if (!Array.isArray(data) || data.length === 0) return null;

    const headers = Object.keys(data[0]);
    const rows = [
      // Header row
      new TableRow({
        children: headers.map(header => 
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: header, bold: true })]
            })]
          })
        )
      }),
      // Data rows
      ...data.map(row => 
        new TableRow({
          children: headers.map(header =>
            new TableCell({
              children: [new Paragraph({ text: String(row[header] || '') })]
            })
          )
        })
      )
    ];

    return new Table({
      rows: rows,
      width: { size: 100, type: 'pct' }
    });
  }
}

module.exports = DocumentService;
