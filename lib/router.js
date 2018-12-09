const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const moment = require('moment');

// Get the keylog entries
router.get('/archive', (req, res) => {
  let queryParams = [
    req.query.start
      ? moment(req.query.start).format('YYYY-MM-DD HH:mm:ss')
      : moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    req.query.end
      ? moment(req.query.end).format('YYYY-MM-DD HH:mm:ss')
      : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ]

  let page = parseInt(req.query.page) || 0;
  let limit = parseInt(req.query.limit) || 50;
  let offset = page * limit;

  // Init query filtering by date
  let query = "SELECT SQL_CALC_FOUND_ROWS * FROM keylogs WHERE timestamp BETWEEN ? AND ? "

  // Optionally add text filter search
  if (req.query.search) {
    query += 'AND (hostname LIKE ? OR path LIKE ?) ';
    queryParams.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }

  // Add params for pagination
  queryParams.push(limit);
  queryParams.push(offset);
  query += "LIMIT ? OFFSET ?;"

  global.conn.query(query, queryParams, (err, results) => {
    global.conn.query("SELECT FOUND_ROWS() as total;", (err, total) => {
      res.send({total: total[0].total, data: results, page: page, limit: limit});
    });
  })
});

// Remove keylog entry by id
router.delete('/archive/:id', (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM keylogs WHERE id = ?";
  global.conn.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({message: `An error occurred while removing entry ID: ${id}.`, error: err})
      return;
    }
    res.send({message: `Entry ID: ${id} successfully removed.`})
  })
})

module.exports = router;
