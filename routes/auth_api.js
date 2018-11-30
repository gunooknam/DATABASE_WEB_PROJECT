//<------------ Rest Auth Api ------------>
module.exports = function(passport){

var nodemailer = require('nodemailer');
var Transport = nodemailer.createTransport({
    service: 'gmail',
    auth : {
      user: 'gunooknam@gmail.com',
      pass: 'akdakdakd1!',
    }
 });

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var conn = require('../config/database')();
var router=require('express').Router();

router.get('/login',function(req, res){
  if(req.user){
   return res.render("/",{ user:req.user});
   }
   res.render('auth/login', { user:req.user, message : req.flash('message') } );
});


router.get(
  '/google',
  passport.authenticate('google',
  { scope: ['email','openid']} )
 );
// 페이스 북과 같은 타사인증은 라우트가 두개다.

router.get(
  '/google/redirect',
   passport.authenticate(
  'google', {
      failureRedirect: '/login',
      failureFlash: false
}), (req, res) => {
      loginSuccessHandler(req, res);
});

// 깃허브 로그인 시작
router.get('/github',
  passport.authenticate('github')
);

// 깃허브 로그인 결과 콜백
router.get(
    '/github/callback',
     passport.authenticate(
    'github', {
    failureRedirect: '/auth/login'
}), (req, res) => {
    loginSuccessHandler(req, res);
});

function loginSuccessHandler(req, res) {  // 소셜로그인으로 기록되지 않은 유저정보가 있을 시에 추가 작성을 위한 페이지로 이동
    let successRedirectUrl = "/"; //이 전에 정보를 모두 입력한 유저가 접속하였을 때의 URL
    let addinfo="/auth/addinfo"; //이 경우는 소셜 로그인을 처음 했을 때 추가적인 개인정보 필요할 때

    console.log("sdsd");

    const sql=`select uno, userid, name, nickname from user where ( uno=? ) AND ( gender IS NULL OR age IS NULL OR phone IS NULL OR address IS NULL)`;
    conn.query(sql,[req.user.uno], function(err, results){
        if(results.length > 0){
          return res.redirect(addinfo);
        }else {
          return res.redirect(successRedirectUrl);
        }
    });
}

  router.post(
    '/login',
    passport.authenticate(
      'local',
       {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: false
       }
    )
  );

 router.post('/addinfo',(req,res)=>{
     console.log(req.body);
     const uno=req.user.uno;
     var today = new Date();
     let age = today.getFullYear()-req.body.birth.substr(0, 4)+1;

     var set = [
       req.body.gender,
       age,
       req.body.cellPhone,
       req.body.address,
       uno
     ];

     let sql = 'UPDATE user SET gender=?, age=?, phone=?, address=? where uno=?';

     conn.query(sql, set, function(err, results){
       if(err) {
         return res.status(400).json({
             error: "회원 정보 추가에 실패하였습니다.",
             code: 1
         });
       } else {
         return res.json({
             success: "회원가입 성공"
         });
       }
     });
 });

// Rest API 방식이고, ejs에서는 ajax 로 동작
  router.post('/register', function(req,res){
     hasher({password:req.body.password}, function(err, pass, salt, hash){
          let uno = "local:"+req.body.email;
          let sql = 'SELECT uno from user Where uno=?';

          conn.query(sql, [uno], function(err, results){
              if(results.length>0){
                console.log("이미 동일한 계정이 있습니다.");
                return res.status(400).json({
                    error: "이미 존재하는 계정입니다.",
                    code: 1
                });
              }
          });

         var today = new Date();
         let age = today.getFullYear()-req.body.birth.substr(0, 4)+1;
         var user = {
            uno: 'local:'+req.body.email,
            userid: req.body.email,
            password: hash,
            name: req.body.name,
            nickname:req.body.nickname,
            profileimage:req.body.profileimage,
            gender:req.body.gender,
            age:age,
            phone:req.body.cellPhone,
            address:req.body.address,
            salt:salt
         };

         sql = 'INSERT INTO user SET ?';
         conn.query(sql, user, function(err, results){
          if(err) {
            console.log(err);
            res.status(500);
          } else {
              req.login(user, function(err){
                req.session.save(function(){
                    return res.json({
                        success: "회원가입 성공"
                    });
                });
             });
           }
        });
     });
  });


  router.get('/logout', function(req,res){
    //console.log(req.user);
    delete req.user;
    req.session.save(function(){
      req.session.destroy();
      res.redirect('/'); //save라는 함수가 있고 여기서 콜백을 준다.
    }); //저장이 끝났을 떄 인자로 전달한 콜백을 나중에 호출한다.
  });

  router.get('/register', function(req, res){
      res.render('auth/register');
  });

  router.get('/addinfo', function(req, res){
      res.render('auth/addinfo', {user: req.user});
  });

  router.get('/myinfo', function(req, res){
    console.log(req.user);
    console.log("hello");

    let uno=req.user.uno;
    console.log(uno);
    let sql = 'SELECT * from user where uno=?';
    conn.query(sql, [uno], function(err, results){
      if(err) {
        return res.status(400).json({
            error: "회원 정보 불러오기 실패.",
            code: 1
        });
      } else {

        return res.json({
            profileimage: results[0].profileimage,
            email: results[0].userid,
            name: results[0].name,
            nickname: results[0].nickname,
            gender: results[0].gender,
            phone: results[0].phone,
            address: results[0].address
        });
      }
    });

  });

router.get('/findpwd', function(req, res){

  // 임시로 디자인용으로
  res.render('auth/findpwd', {user: req.user});

});

var generateRandom = function (min, max) {
    var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;
}

// 임시 비빌번호를 생성하고 그것을 임시로 세션에 저장한다.
router.post('/findpwd', function(req, res){

  console.log(req.session.temppwd);

  const sql = "select userid from user where uno=? ";

  let email = 'local:'+req.body.email;

  console.log("여기"+email);

  conn.query(sql, email, function(err, results){

    if(err) {
      return res.status(400).json({
          error: "존재하지 않는 이메일입니다.",
          code: 1
      });
    } else {

      if(results.length !=0 ){

        req.session.temppwd=generateRandom(100000,999999);

        var output=`<style>
          .email-verification .content {
            width: 768px;
            margin: 0 auto;
            background: #f8f9fa;
            padding: 1.5rem;
            text-align: center;
            color:#495057;
          }
          .email-verification .content p {
              font-weight: 300;
              font-size: 1.5rem;
          }
          .email-verification .content .description {
              text-align: center;
              margin-top: 2rem;
              color: #495057;
          }
        </style>
        <div class="email-verification">
          <div class="content">
             <h1>안녕하세요!</h1>
            <span><img src="https://user-images.githubusercontent.com/37025923/49249991-110efc80-f461-11e8-9638-587e3cc926b9.png"></span> <span><h1 style="display:inline-block">입니다.</h1></span>

                <div class="description">
                     <strong>비밀번호를 잃어버리셨군요!</strong>
                  <p><strong>고객님의 인증번호는? ${req.session.temppwd} 입니다.</strong></p>
                </div>
            </div>
         </div> `;

          var mailOptions = {
           from: 'gunooknam@gmail.com',
           to: req.body.email,
           subject:"Movie Hi 인증번호 발송",
           html: output
         }

         Transport.sendMail(mailOptions, function(err, info){
          if(err) console.log(err);
          else {
            console.log('Email sent : ' + info.response);
          }
        });

          return res.json({
              success: "메일 전송"
          });

      }else{

        return res.status(400).json({
            error: "존재하지 않는 이메일입니다.",
            code: 1
        });

      }
    }

  });

});

router.get('/newpwd', function(req, res){
  // 임시로 디자인용으로
  res.render('auth/newpwd', {email: req.query.email});
});


 router.post('/newpwd', function(req, res){
   // req.body.email
   if(req.session.temppwd==req.body.tempnumber){
     return res.json({
         success: "인증번호 일치"
     });
     delete req.session.temppwd; // 이제 세션을 삭제

   } else {
     return res.status(400).json({
         error: "인증번호가 틀렸어요.",
         code: 1
     });

   }

 });

 router.post('/newpwdregister', function(req, res){


        hasher({password:req.body.password}, function(err, pass, salt, hash){
            var set = [
               hash,
               salt,
              'local:'+req.body.email
            ]

          console.error("비밀번호변경페이지");
          var sql = "update user set password=?, salt=? where uno=?"

          conn.query(sql, set, function(err,rows){

            if(err) console.error(err);

              return res.json({
                  success: "비밀번호 변경에 성공"
              });

          });
        });

 });



  return router;
}
