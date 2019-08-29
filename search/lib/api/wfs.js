const express = require('express');

const router = express.Router();

router.get('/collections', (req, res) => {
  res.json({ status: 'okay' });
});

module.exports = router;
