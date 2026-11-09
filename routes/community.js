var express = require('express');
var router = express.Router();

// community page
router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/socials', function(req, res, next) {
  res.render('index');
});

router.get('/contentcreators', function(req, res, next) {
  res.render('index');
});

module.exports = router;
