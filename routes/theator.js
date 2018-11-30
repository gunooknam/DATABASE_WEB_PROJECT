var express = require('express');
var router = express.Router();
var conn = require('../config/database')();




router.get('/getinfo', function(req, res){

  const sql = 'select distinct * from theater';
  conn.query(sql, function(err, rows){
    if(err) {
      console.log(err);
      return res.status(400).json({
          error: "조회에 실패하였습니다.",
          code: 1
      });
    }
    else {
      return res.json(
        rows
      );
    }
  });

});


router.post('/registermovie', function(req, res){
  console.log("<< 여기가 어딜까요? ");
  var locations=req.body.locations;
  var closedate = req.body.closedate;
  var movieid=req.body.movieid;
  console.log(">>");

    var sql = 'select movieid from releasemovie where movieid=?' ;
    conn.query(sql, [movieid], function(err, result){

      if(!result.length){
        console.log("어디로");
          let sql = 'insert into releasemovie(closedate,  theaters, movieid) values( ?, ?, ?)';
          conn.query(sql, [closedate, locations, movieid ], function(err, result){
            if(err) {
              return res.status(400).json({
                  error: "등록에 실패하였습니다.",
                  code: 1
              });
            } else {
              return res.json({
                   success: "상영영화에 등록되었습니다."
               });
            }
          });

      }else{
        //let sql = 'UPDATE user SET gender=?, age=?, phone=?, address=? Where uno=?';
        console.log("오는거니");
        let sql = 'update releasemovie SET closedate=?, theaters=? where movieid=?';
        conn.query(sql, [closedate, locations, movieid ], function(err, result){
          if(err) {
            return res.status(400).json({
                error: "등록에 실패하였습니다.",
                code: 1
            });
          } else {
            return res.json({
                 success: "상영영화에 등록되었습니다."
             });
          }
        });


      }
    });


});


router.get('/' , function(req, res){
  res.render('theator/info', { user: req.user });
});

module.exports = router;
