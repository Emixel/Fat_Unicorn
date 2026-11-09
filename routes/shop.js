var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('pages/merch', {
    activePage: 'merch',
    pageTitle: 'Merch | The Fat Unicorns'
  });
});

module.exports = router;
