module.exports = function(){
  const pw = require('./pw');
  var express = require('express');
  var app = express();
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session);
  var bodyParser = require('body-parser');
  var cookieParser = require('cookie-parser');
  var mysql = require('mysql');
  var path = require('path');
  var logger = require('morgan');   //method-override
  var methodOverride = require('method-override'); //이거 반드시 해줘야함 반드시 ! delete, put 방식을 사용하려면
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join('public')));
  app.use(methodOverride()); // PUT, DELETE를 지원 안 하는 클라이언트를 위해
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:false}));
  app.use(session({
      secret: '12345',
      resave: false,
      saveUninitialized: true,
      store:new MySQLStore({
      host:'localhost',
      port:3306,
      user:'root',
      password: pw,
      database:'mydb',
      checkExpirationInterval: 9000,
      expiration: 864000,
      clearExpired: true
      })
  }));

  return app;
}
