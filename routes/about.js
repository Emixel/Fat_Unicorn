var express = require('express');
var router = express.Router();

// about page
router.get('/', function(req, res, next) {
  res.render('pages/about', {
    activePage: 'about',
    pageTitle: 'About Us | The Fat Unicorns'
  });
});


// Join us page
router.get('/joinus', function(req, res, next) {
  res.render('pages/about', {
    activePage: 'about',
    pageTitle: 'About Us | The Fat Unicorns'
  });
});


module.exports = router;
