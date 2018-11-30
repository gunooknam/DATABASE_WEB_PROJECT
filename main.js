import webpack from 'webpack';

import WebpackDevServer from 'webpack-dev-server';

var socketio = require('socket.io');

var app = require('./config/express')();

var passport = require('./config/passport')(app);

var path = require('path');

var fs = require('fs');

var http = require('http');

app.set('views', path.join('views'));

app.set('view engine', 'ejs');

const port =3000;

const devPort = 4000;

var mypageRouter = require('./routes/mypage');

var auth_apiRouter = require('./routes/auth_api')(passport); //=> for Rest Api

var movieRouter = require('./routes/movie');

var adminRouter = require('./routes/admin');

var theatorRouter = require('./routes/theator');

var seatRouter = require('./routes/seat');

app.get('/.hello', (req,res)=>{
  return res.send('Hello CodeLab');
});

app.use('/auth',auth_apiRouter);

app.use('/', mypageRouter);

app.use('/movie', movieRouter);

app.use('/admin', adminRouter);

app.use('/theator', theatorRouter);



app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('<script>location.href="500.html"</script>');
});


var server =http.createServer(app);
server.listen(3000,function(){
  console.log('Server Running at Cinema world');
});


app.use('/seat', seatRouter);

app.use('*', function(req, res) {
  res.send('<script>location.href="404.html"</script>');
});

if(process.env.NODE_ENV == 'development') {
    console.log('Server is running on development mode');
    const config = require('./webpack.dev.config');
    const compiler = webpack(config);
    const devServer = new WebpackDevServer(compiler, config.devServer);
    devServer.listen(
        devPort, () => {
            console.log('webpack-dev-server is listening on port', devPort);
        }
    );
}
