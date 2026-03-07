var express = require('express');
var router = express.Router();
const loadHTML = require('../utils/loadHTML');

  let headerHTML;  
  let maininfoHTML;
  let bottomHTML;
try {
  headerHTML = loadHTML('header.html');
  maininfoHTML = loadHTML('maininfo.html');
  bottomHTML = loadHTML('bottom.html');
  menuHTML = loadHTML('menu.html');
} catch (err) {
  console.error(err);
}

// games page
router.get('/', function(req, res, next) {
  res.send(headerHTML + menuHTML + "Games page etc..." + bottomHTML)
});

// Events and tournaments page
router.get('/eventsTournaments', function(req, res, next) {
  res.send(headerHTML + menuHTML + "Events and tournaments page etc..." + bottomHTML)
});


// Teams and stats page
router.get('/teamsStats', function(req, res, next) {
  res.send(headerHTML + menuHTML + "Teams and stats page etc..." + bottomHTML)
});

module.exports = router;
