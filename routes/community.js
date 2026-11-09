var express = require('express');
var router = express.Router();

// community page
router.get('/', function(req, res, next) {
  res.render('pages/servers', {
    activePage: 'servers',
    pageTitle: 'Servers | The Fat Unicorns'
  });
});


router.get('/socials', function(req, res, next) {
  res.render('pages/servers', {
    activePage: 'servers',
    pageTitle: 'Servers | The Fat Unicorns'
  });
});

router.get('/contentcreators', function(req, res, next) {
  res.render('pages/creators', {
    activePage: 'creators',
    pageTitle: 'Creators | The Fat Unicorns'
  });
});

module.exports = router;
