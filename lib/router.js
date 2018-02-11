const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const moment = require('moment');

router.get('/archive', (req, res) => {
  const queryParams = [
    moment(req.query.start).format('YYYY-MM-DD HH:mm:ss'),
    moment(req.query.end).format('YYYY-MM-DD HH:mm:ss')
  ]
  const query = "SELECT * FROM keylogs WHERE timestamp BETWEEN ? AND ?;"
  conn.query(query, queryParams, (err, results) => {
    res.send(results)
  })
});

module.exports = router;
