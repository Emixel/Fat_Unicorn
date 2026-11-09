var express = require('express');
var router = express.Router();


// games page
router.get('/', function(req, res, next) {
  res.render('pages/events', {
    activePage: 'events',
    pageTitle: 'Events | The Fat Unicorns'
  });
});

// Events and tournaments page
router.get('/eventsTournaments', function(req, res, next) {
  res.render('pages/events', {
    activePage: 'events',
    pageTitle: 'Events | The Fat Unicorns'
  });
});


// Teams and stats page
router.get('/teamsStats', function(req, res, next) {
  res.render('pages/servers', {
    activePage: 'servers',
    pageTitle: 'Servers | The Fat Unicorns'
  });
});

module.exports = router;
