module.exports = function(app){
  var conn = require('./database')();
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var GoogleStrategy = require('passport-google-oauth20');
  var GitHubStrategy = require('passport-github').Strategy;
  var flash = require('connect-flash');
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done){

    console.log('serializeUser',user.uno);

    return done(null, user.uno);
  });

  passport.deserializeUser(function(id, done){
    console.log('deserializeUser', id);
    var sql = 'SELECT * FROM user WHERE uno =?';
    conn.query(sql, [id],function(err, results){

      if(err) {
        done('There is no user.');
      } else {
        return done(null, results[0]);
      }

    });
  });

  passport.use(
    'local',
    new LocalStrategy({
      username : 'username',
      password : 'password',
      passReqToCallback :true
    },
    function(req, username, password, done){
       console.log("여긴 로컬 스트래터지");
       var uno = username;
       var pwd = password;
       var sql = 'SELECT * FROM user WHERE uno=?';
        conn.query(sql, ['local:'+uno], function(err, results){
          if(err){
            return done(err);
          }
          if(!results.length){
            return done(null, false, req.flash('message', '검색된 사용자가 없습니다.'));
                                                //검색된 사용자가 없습니다.
          }
        console.log("여기 왜감?");
        var user = results[0];
        return hasher({password:pwd, salt: user.salt},
        function(err, pass, salt, hash){
            if(hash === user.password){
                console.log('LocalStrategy', user);
                done(null, user);
             } else {
                done(null, false, req.flash('message','비밀번호가 틀립니다.'));
                                            //비밀번호가 틀립니다.
             }
         });
      });
      }
  ));


  passport.use(new GitHubStrategy({
      clientID: '0de32c5821c39f9c89d1',
      clientSecret: '8986b858f22e011a036a861dce68a849d85bcb67',
      callbackURL: "http://127.0.0.1:3000/auth/github/callback",
      scope: 'user:email'
      },
      function(accessToken, refreshToken, profile, done) {
        console.log("여기는 깃허브 스트렛티지");
        console.log(profile);
        console.log(profile.id + profile.username+ "이메일 정보닷>>"+profile.emails[0].value+"이번엔 아바타 유알엘>>"+profile.photos[0].value);

        var uno = 'github:' + profile.id;
        var sql = 'SELECT * FROM user WHERE uno=?';
        conn.query(sql, [uno], function(err, results){

         if(results.length>0){
            return done(null, results[0]);
         } else {

            var newuser = {
              'uno': uno,
              'userid':  profile.emails[0].value,
              'name': profile.username,
              'nickname': profile.displayName,
              'profileimage':profile.photos[0].value,
            };

            console.log(newuser);
            var sql = 'INSERT INTO user SET ?';
            conn.query(sql, newuser, function(err, results){
                  if(err){
                    console.log(err);
                    done('Error');
                  }
                  else {
                    console.log("4");
                     done(null, newuser);
                  }
            });
        }
      });
    }
  ));


  passport.use(new GoogleStrategy({
      callbackURL:'http://localhost:3000/auth/google/redirect',
      clientID: '215504541044-qse6141f1rm9283cma55u4gtq08nh1rh.apps.googleusercontent.com',
      clientSecret: '-TnJ2fPNe-RrySP8Kotwj_hf'
    },
    function(accessToken, refreshToken, profile, done) {
          console.log("여기는 구글 스트렛티지");
          var uno = 'google:' + profile.id;
          var sql = 'SELECT * FROM user WHERE uno=?';

          console.log(profile);

          conn.query(sql, [uno], function(err, results){

               if(results.length>0){
                 
                 return done(null, results[0]);

               } else {

              var newuser = {
                'uno': uno,
                'userid':  profile.emails[0].value,
                'name': profile.name.familyName+profile.name.givenName,
                'nickname': profile.displayName,
                'profileimage':profile.photos[0].value
              };

            console.log(newuser);
            var sql = 'INSERT INTO user SET ?';
            conn.query(sql, newuser, function(err, results){
                  if(err){
                    console.log(err);
                    done('Error');
                  }
                  else {
                    done(null, newuser);
                  }
            });

          }
        });
      }
  ));
  return passport;
}
