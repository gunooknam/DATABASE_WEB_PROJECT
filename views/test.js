var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var fs = require('fs');

var mysql = require('mysql');
var conn = mysql.createConnection({
 host     : 'localhost',
 port     :  3306,
 user     : 'root',
 password :  '123456',
 database : 'mydb'
});
// 이게 원래의 좌석의 모습이다.
/*var seats=[
 [1,1,0,1,1,1,1,1,1,1,1,0,1,1],
 [1,1,0,1,1,1,1,1,1,1,1,0,1,1],
 [1,1,0,1,1,1,1,1,1,1,1,0,1,1],
 [1,1,0,1,1,1,1,1,1,1,1,0,1,1],
 [1,1,0,1,1,1,1,1,1,1,1,0,1,1],
 [1,1,0,1,1,1,1,1,1,1,1,0,1,1],
 [1,1,0,1,1,1,1,1,1,1,1,0,1,1]
];*/
// 이건 디비에 들어가는 형태이다.
var jsonseat= "[ {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 },\
                 {a:1, b:1, c:0, d:1, e:1, f:1, g:1, h:1,i:0, j:1, k:1 }]";
// 이것은 key map table
var map = ['a','b','c','d','e','f','g','h','i','j','k' ];
// json 배열 스트링을 받으면 여석 카운트를 뽑아준다.
var seatCount = function(jsonseat){
  var seatlist= eval(jsonseat)
  var seats =[];
  var count=0;
  for( var a of seatlist){ //console.log(seatlist[0]);
     var json=a;
     for(key in json) {
       //console.log('key:' + key + ' / ' + 'value:' + json[key]);
       if(json[key]===1)
          count++;
     }
  }
  //console.log(count);
  return count;
}

// 1번 스트링을 리스트로 바꾼다.
// (디비에서 제이슨 리스트 스트링을 꺼내온다.) 그리고 여기서 표현할 때는 제이슨 리스트로 바꾼다.
var makeseatList = function(jsonseat){
  var seatList= eval(jsonseat)
  var seats =[];
  return seatList;
}

// 2번 리스트로 바꿔진 스트링에서 좌표값에 접근하여 해당 값을 수정한다. 2로 바꾼다.
var changePoint = function( seatList, data_y, data_x ){
    seatList[data_y][map[data_x]]=2;
}

//json 리스트를
var jsontoArray = function( jsonList ){
  var array=[];
  for( var a of jsonList){
     var element=[];
     for(key in a) {
         element.push(a[key]);
     }
     array.push(element);
  }
  return array;
}

console.log(jsontoArray(makeseatList(jsonseat)));
var seats=jsontoArray(makeseatList(jsonseat));
/* var current=makeseatList(jsonseat);
   console.log("<<<<");
   console.log(current);
   console.log(">>>>");
   changePoint( current,1, 4 );
   changePoint( current,1, 2 );
   changePoint( current,1, 3 );
   console.log(current);      */
// 이것은 제이슨 리스트를 다시 디비에 저장할 때 스트링화를 거친다.

var app = express();
app.get('/', function(req, res, next){
  fs.readFile('HTMLPage.html', function(error, data){
    res.send(data.toString());
  });
});

app.get('/seats', function(req,res,next){
  var sql = 'select movie.movieid from movie';
  conn.query(sql, function(err, result){
    //이쪽으로 요청을 걸면
    //==> 좌석 정보를 디비에서 꺼내온다.
    console.log(result);
  });

  console.log('Server Seats Call!');
  res.send(req.query.callback + '('+ JSON.stringify(seats) + ');' );
});

var server =http.createServer(app);
server.listen(8000,function(){
  console.log('Server Running at 몰라  ');
});

var io = socketio.listen(server);

io.sockets.on('connect', function(socket){

  socket.on('reserve',function(data){
    seats[data.y][data.x] = 2;
    console.log("이거댐?");
    io.sockets.emit('reserver', data);
  });

  socket.on('save',function(data){
    console.log("이거는 세이브야");
  });

});
