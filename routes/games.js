var express = require('express');
var router = express.Router();


// games page
router.get('/', function(req, res, next) {
  res.render('index');
});

// Events and tournaments page
router.get('/eventsTournaments', function(req, res, next) {
  res.render('index');
});


// Teams and stats page
router.get('/teamsStats', function(req, res, next) {
  res.render('index');
});

module.exports = router;
