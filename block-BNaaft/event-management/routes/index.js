var express = require('express');
var router = express.Router();
var Event = require('../models/Event');

/* home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// add new event
router.get('/new', (req, res) => {
  res.render('addEvents');
});

module.exports = router;