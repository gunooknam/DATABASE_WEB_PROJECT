var express = require('express');
var router = express.Router();
var conn = require('../config/database')();
var multer = require('multer');

var _storage = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, 'public/uploadimg');
  },
  filename: function(req,file,cb){
      cb(null, file.originalname );
  }
});

var upload = multer({ storage :_storage });


// 여기는 베너영화를 조회하는 부분
router.get('/bannermovie',function(req, res){
  var sql = 'select movie.movieid, title, description, runtime, voteavg, date_format(releasedate,"%Y년 %m월 %d일") as releasedate, director.name, bannermovie.bannerimg from movie, director, bannermovie where (director.directorid=movie.directorid) and (bannermovie.movieid=movie.movieid)';
  conn.query(sql, function(err, rows){
    res.render('admin/movie/bannermovie', { user: req.user, rows:rows });
  });
});



// 여기는 베너영화를 삭제하는 부분
router.delete('/bannermovie/:movieid', (req, res)=> {
  const mid = req.params.movieid
  var sql = 'delete from bannermovie where movieid=?';
  conn.query(sql, mid, function(err, result){
    if(err){
      return res.status(400).json({
          error: "삭제 실패하였습니다.",
          code: 1
      });
    }else{
      return res.json({
           success: "삭제 되었습니다."
       });
    }

  });

});

// 여기는 베너영화를 수정하는 부분
router.put('/bannermovie/:movieid' , upload.single('userfile'), (req, res)=> {
  const mid = req.params.movieid;
  var img= req.file;
  var sql = 'update bannermovie set bannerimg=? where movieid=?';
  conn.query(sql,["/uploadimg/"+img.filename, mid], function(err, result){
    if(err){
      return res.status(400).json({
          error: "수정에 실패하습니다.",
          code: 1
      });
    }else{
      return res.json({
           success: "수정 되었습니다."
       });
    }

  });

});


// 여기는 베너 영화를 집어넣는 부분
router.post('/bannermovie', upload.single('userfile'), function(req, res){
  var img= req.file;
  var mid=req.body.movieid;
  console.log("여어기"+mid);

  let sql = 'insert into bannermovie(movieid, bannerimg) values( ?, ?)';
  conn.query(sql, [mid,"/uploadimg/"+img.filename], function(err, result){
    if(err) {
      return res.status(400).json({
          error: "이미 등록된 영화입니다.",
          code: 1
      });
    } else {
      return res.json({
           success: "베너에 등록되었습니다."
       });
    }
  });

});


router.get('/bannerrelease',function(req, res){

  var sql = 'select distinct movie.movieid, title, description, runtime, poster , date_format(releasedate,"%Y년 %m월 %d일") as releasedate, director.name, releasemovie.theaters from movie, director, bannermovie, releasemovie where (releasemovie.movieid=movie.movieid) and (director.directorid=movie.directorid) ';
  conn.query(sql, function(err, rows){

    res.render('admin/movie/bannerrelease', { user: req.user, rows:rows });

  });

});


router.get('/movie/read',function(req, res){
  let mid = req.query.movieid;
  let page= req.query.page;
  console.log(mid);
  var sql = 'select movie.movieid, title, description, poster, runtime, voteavg, votecount, date_format(releasedate,"%Y년 %m월 %d일") as releasedate, director.name, genre.genre from movie, director, movie_genre, genre where(director.directorid=movie.directorid) and (movie.movieid=movie_genre.movieid) and (movie_genre.genreid=genre.genreid) and movie.movieid=?';
  conn.query(sql, mid, function(err, result){
    if(err)
     console.log('err : ' + err);
    else
      console.log(result[0]);

    var sql2 = 'select actor.name from appearance, actor where (actor.actorid=appearance.actorid) and movieid=?';
    conn.query(sql2, mid, function(err, actors){
        console.log(actors[0]);
    return res.render('admin/movie/read', { user: req.user, rows:result[0], page:page, actors: actors});

    });

  });

});


router.get('/index',function(req, res){
   return res.render('admin/index',{ user: req.user});
});

router.get('/movie',function(req, res){
    console.log(req.query.search);
    console.log("여어기");

      if(req.user.name==="관리자"){
        var sql = `select movieid, title, description, runtime, voteavg, date_format(releasedate,"%Y년 %m월 %d일") as releasedate, director.name from movie, director where  title LIKE "%${req.query.search}%" and (director.directorid=movie.directorid) and (runtime !=0) ORDER BY releasedate DESC` ;
        console.log(sql);
        // select movieid, title, description, runtime, voteavg, date_format(releasedate,"%Y년 %m월 %d일") as releasedate, director.name from movie, director where movie.title LIKE "%성난%" and (director.directorid=movie.directorid) and (runtime !=0)  ORDER BY releasedate DESC ;
         conn.query(sql, function(err, rows){
           if(err)
            console.log('err : ' + err);
            else{
             console.log(rows.length);
             var totalCount=rows.length;

             var page =req.params.page;
             if(typeof page=="undefined")
              page=1;
             var page_num=10;
             var endPage = Math.ceil(page/page_num )* page_num;

             var startPage = (endPage - page_num) +1;
             var tempEndPage = Math.ceil(totalCount / page_num);
             if(endPage > tempEndPage) {
                endPage = tempEndPage;
             }
             var prev = startPage == 1 ? false : true;
             var next = endPage * page_num >= totalCount ? false : true;

             if(next==false)
              endPage=endPage-1;
              var PageMaker = {
                page:page,
                page_num:page_num,
                totalCount: totalCount,
                startPage: startPage,
                endPage : endPage,
                prev:prev,
                next:next
              }
              console.log(rows);
              console.log(PageMaker);
             return res.render('admin/movie/movie', { user: req.user, rows:rows, PageMaker:PageMaker });
            }
         });
      }

});


router.get('/movie/:page',function(req, res){

  console.log("여어기");
    if(req.user.name==="관리자"){
      var sql = 'select movieid, title, description, runtime, voteavg, date_format(releasedate,"%Y년 %m월 %d일") as releasedate, director.name from movie, director where (director.directorid=movie.directorid) and (runtime !=0) ORDER BY releasedate DESC';

       conn.query(sql, function(err, rows){
         if(err)
          console.log('err : ' + err);
          else{
           console.log(rows.length);
           console.log(Object.keys(rows[0]));

           var totalCount=rows.length;
           var page =req.params.page;
           var page_num=10;
           var endPage = Math.ceil(page/page_num )* page_num;

           var startPage = (endPage - page_num) +1;
           var tempEndPage = Math.ceil(totalCount / page_num);
           if(endPage > tempEndPage) {
              endPage = tempEndPage;
           }
           var prev = startPage == 1 ? false : true;
           var next = endPage * page_num >= totalCount ? false : true;

           if(next==false)
            endPage=endPage-1;
            var PageMaker = {
              page:page,
              page_num:page_num,
              totalCount: totalCount,
              startPage: startPage,
              endPage : endPage,
              prev:prev,
              next:next
            }

           return res.render('admin/movie/movie', { user: req.user, rows:rows, PageMaker:PageMaker });
          }
       });
    }

});

module.exports = router;
