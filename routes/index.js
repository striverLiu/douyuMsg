var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/msg', function(req, res, next) {
  res.render('msg', { title: req.query.name });
});

module.exports = router;
