var express = require('express');
var router = express.Router();
var conn = require('../config/database')();
// this is Api for movie information


router.get('/detail', function(req, res) {

   res.render('movie/moviedetail');

});



router.get('/bannermovie', function(req, res) {

    var sql = 'select movie.movieid, bannerimg, title, description, runtime, voteavg, date_format(releasedate,"%Y년 %m월 %d일") as releasedate, director.name from movie, director, bannermovie where (director.directorid=movie.directorid) and (bannermovie.movieid=movie.movieid)';
      conn.query(sql, function(err, rows){
        if(err){
          return res.status(400).json({
            error: "등록된 영화가 없습니다.",
            code: 1
          });
        }else {
          return res.json(rows);
        }
    });

});




router.get('/bannerrelease', function(req, res) {


  var sql = 'select distinct movie.movieid, title, description, runtime, poster , date_format(releasedate,"%Y년 %m월 %d일") as releasedate, director.name, releasemovie.theaters from movie, director, bannermovie, releasemovie where (releasemovie.movieid=movie.movieid) and (director.directorid=movie.directorid) ';
  conn.query(sql, function(err, rows){

    if(err){
      return res.status(400).json({
        error: "등록된 영화가 없습니다.",
        code: 1
      });
    }else {
      return res.json(rows);
    }

  });

});







module.exports = router;
