import pool from '../../../database/db';

export class RankingService {
  /**
   * Recalculates all ranks for an event (Overall, Gender, Category)
   */
  static async calculateRanks(client: any, eventId: string) {
    // 1. Fetch all participants and their results for this event
    const resultsRes = await client.query(`
      SELECT 
        r.id as result_id, 
        r.chip_time, 
        r.gun_time, 
        p.gender, 
        p.category_id,
        p.id as participant_id
      FROM results r
      JOIN participants p ON r.participant_id = p.id
      WHERE r.event_id = $1 AND r.status = 'FINISHED'
      ORDER BY r.chip_time ASC, r.gun_time ASC, r.bib_number ASC
    `, [eventId]);

    const results = resultsRes.rows;

    // 2. Calculate Overall Rank
    for (let i = 0; i < results.length; i++) {
      await client.query(
        'UPDATE results SET overall_rank = $1 WHERE id = $2',
        [i + 1, results[i].result_id]
      );
    }

    // 3. Calculate Gender Rank
    const genders = ['MALE', 'FEMALE'];
    for (const gender of genders) {
      const genderResults = results.filter(r => r.gender === gender);
      for (let i = 0; i < genderResults.length; i++) {
        await client.query(
          'UPDATE results SET gender_rank = $1 WHERE id = $2',
          [i + 1, genderResults[i].result_id]
        );
      }
    }

    // 4. Calculate Category Rank
    const categoriesRes = await client.query('SELECT id FROM event_categories WHERE event_id = $1', [eventId]);
    for (const cat of categoriesRes.rows) {
      const catResults = results.filter(r => r.category_id === cat.id);
      for (let i = 0; i < catResults.length; i++) {
        await client.query(
          'UPDATE results SET category_rank = $1 WHERE id = $2',
          [i + 1, catResults[i].result_id]
        );
      }
    }
  }
}
