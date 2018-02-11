const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const moment = require('moment');

// Get the keylog entries
router.get('/archive', (req, res) => {
  let queryParams = [
    // Starting date range
    req.query.start
      ? moment(req.query.start).format('YYYY-MM-DD HH:mm:ss')
      : moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    // Ending date range
    req.query.end
      ? moment(req.query.end).format('YYYY-MM-DD HH:mm:ss')
      : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ]

  // Init query filtering by date
  let query = "SELECT * FROM keylogs WHERE timestamp BETWEEN ? AND ?"

  // Optionally add text filter search
  if (req.query.search) {
    query += ' AND (hostname LIKE ? OR path LIKE ?);';
    queryParams.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }

  conn.query(query, queryParams, (err, results) => {
    res.send(results)
  })
});

// Remove keylog entry by id
router.delete('/archive/:id', (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM keylogs WHERE id = ?";
  conn.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({
        message: `An error occurred while removing entry ID: ${id}.`,
        error: err
      })
      return;
    }
    res.send({ message: `Entry ID: ${id} successfully removed.` })
  })
})

module.exports = router;
