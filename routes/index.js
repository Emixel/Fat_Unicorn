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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(headerHTML + menuHTML + maininfoHTML + bottomHTML)
});

module.exports = router;
