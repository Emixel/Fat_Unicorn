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

// community page
router.get('/', function(req, res, next) {
  res.send(headerHTML + menuHTML + "Community page etc..." + bottomHTML)
});


router.get('/socials', function(req, res, next) {
  res.send(headerHTML + menuHTML + "Socials page etc..." + bottomHTML)
});

router.get('/contentcreators', function(req, res, next) {
  res.send(headerHTML + menuHTML + "Content Creators page etc..." + bottomHTML)
});

module.exports = router;
