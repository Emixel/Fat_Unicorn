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

// about page
router.get('/', function(req, res, next) {
  res.send(headerHTML + menuHTML + "About page etc..." + bottomHTML)
});


// Join us page
router.get('/joinus', function(req, res, next) {
  res.send(headerHTML + menuHTML + "Join us page etc..." + bottomHTML)
});


module.exports = router;
