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


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(headerHTML + menuHTML + "Shop page etc..." + bottomHTML)
});

module.exports = router;
