const db = require('../../db');

const getReadyForBatch = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM certificate_confirmations WHERE ready_for_batch = true AND status = 'confirmed' OR status = 'corrected'"
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBatch = async (req, res) => {
  try {
    const { certificate_ids, type, admin_notes } = req.body;
    const batch_id = `BATCH-${Date.now()}`;
    const certificates_count = certificate_ids.length;

    // Create a new batch
    const newBatch = await db.query(
      'INSERT INTO batches (id, type, certificates_count, admin_notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [batch_id, type, certificates_count, admin_notes, 'pending_review']
    );

    // Associate certificates with the new batch
    // This part of the logic is complex as it requires updating the `certificates` table,
    // which is not yet being populated. For now, we will just create the batch record.
    // In a real implementation, we would also need to create the certificate records
    // and link them to this batch.

    res.status(201).json(newBatch.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getReadyForBatch,
  createBatch,
};
