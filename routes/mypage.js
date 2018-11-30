var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  res.render('main', { user: req.user });
});

 router.get('/index',function(req, res){

     console.log("<<-----"+req.user.name+"<<-----");

     if(req.user.name==="관리자"){
        return res.render('admin/index', { user: req.user });
     }
     res.render('mypage/index', { user: req.user });






});




module.exports = router;
