var express = require('express');
var router = express.Router();
var conn = require('../config/database')();


router.get('/test', function(req, res, next) {
  //console.log(req.user);
  console.log("들어온 건가");
  res.render('HTMLPage');
});




module.exports = router;
