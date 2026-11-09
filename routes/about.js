var express = require('express');
var router = express.Router();

// about page
router.get('/', function(req, res, next) {
  res.render('index');
});


// Join us page
router.get('/joinus', function(req, res, next) {
  res.render('index');
});


module.exports = router;
