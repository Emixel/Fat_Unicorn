var express = require('express');
var router = express.Router();
var pug = require('pug');
const loadHTML = require('../utils/loadHTML');

  let headerHTML;  
  let maininfoHTML;
  let bottomHTML;
  let menuHTML;
  let renderedHeaderHTML;
  let renderedMaininfoHTML;
  let renderedBottomHTML;
  let renderedMenuHTML;
try {
  headerHTML = loadHTML('header.html');
  maininfoHTML = loadHTML('maininfo.html');
  bottomHTML = loadHTML('bottom.html');
  menuHTML = loadHTML('menu.html');
  let renderedHeaderHTML = pug.renderFile('masterframe/header.pug');
  let renderedMaininfoHTML = pug.renderFile('masterframe/maininfo.pug');
  let renderedBottomHTML = pug.renderFile('masterframe/bottom.pug');
  let renderedMenuHTML = pug.renderFile('masterframe/menu.pug');
} catch (err) {
  console.error(err);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(headerHTML + menuHTML + maininfoHTML + bottomHTML)
});

module.exports = router;
