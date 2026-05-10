import pool from '../../../database/db';

export class TemplateService {
  /**
   * Fetches a template and replaces variables
   */
  static async render(type: string, variables: Record<string, string>) {
    const { rows } = await pool.query('SELECT subject, content_html FROM notification_templates WHERE type = $1', [type]);
    
    if (rows.length === 0) {
      throw new Error(`Template not found: ${type}`);
    }

    let { subject, content_html } = rows[0];

    // Replace variables like {{participant_name}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value || '');
      content_html = content_html.replace(regex, value || '');
    });

    return { subject, html: content_html };
  }
}
