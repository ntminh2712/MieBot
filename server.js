// # SimpleServer
// A simple chat bot server

var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var router = express();
let nodeDate = require('date-and-time');


var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
var options = {
      hour: 'numeric',
      minute: 'numeric'
    },
    intlDate = new Intl.DateTimeFormat( undefined, options );

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");

});

app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'MieBotVerify') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      var name = message.name
      if (message.message) {
        // If user send text
        if (message.message.text) {
          handlerMessage(message.message.text, senderId,name)
        }
      }
    }
  }

  res.status(200).send("OK");
});

function handlerMessage(message, senderId,name) {
  if (message == "help") {
    showHelp(senderId,name)
  }else {
    var option = message.substring(0,6)
    var time = message.substring(7,12)
    var parts = time.split(':');
    var minutes = parts[1]*60+ +parts[0];
    if (option == "sleepy") {
      calTimeWakeUp(0,senderId,0)
      sendMessage(senderId, "Chúc bạn ngủ ngon 😘");
    }else if (option == "wakeup"){
      sendMessage(senderId, "Hi wakeup");
    }else {
      sendMessage(senderId, "Kiểm tra lại câu lệnh của bạn và thử lại sau nhé! Gõ \"help\" để xem danh sách câu lệnh.")
    }
  }
}

function showHelp(senderId,name){
  sendMessage(senderId,"Hi,\n Hiện tại MieBot mới chỉ có tính năng tính toán thời gian ngủ và thời gian thức dậy.\n\n" +
      "Để tính thời gian thức dậy bắt đầu từ lúc bạn thực hiện câu lệnh hãy trả lời :\n\"sleepy\".\n\n" +
      "Để tính thời gian thức dậy tại một thời điểm nhất định bạn thực hiện câu lệnh trả lời :\n\"sleepy+ thời gian\" , ví dụ \"sleep 20:00\".\n\n"+
      "Để tính thời gian muốn thức dậy bạn hãy nhắn tin trả lời : \n\"wakeup + thời gian\", ví dụ \"wakeup 7:00\".\n")
}

function calTimeSleep(time) {
  var listTimeSleep = []
  for (var i = 0; i <= 6; i++) {
    var timeSleep = time - 90*i -14
    listTimeSleep.push(timeSleep)
  }
  sendMessage(senderId,"")

}

function calTimeWakeUp(time,senderId,type) {
  if (type == 0) {
    const currentTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Bangkok'
    });
    sendMessage(senderId,currentTime)
    var listTimeSleep = []
    for (var i = 1; i < 7; i++) {
      var timeSleep = time + 90 * i + 14
      sendMessage(senderId,timeSleep)
      listTimeSleep.push(currentTime + timeSleep)
    }
    sendMessage(senderId, "Bây giờ là " + currentTime +". Nếu bạn lên giường và đi ngủ ngay, thì bạn nên thức dậy vào những khoảng thời gian: \n"
        + intlDate.format( new Date( 1000 * listTimeSleep[0] ) )
        + " hoặc " +intlDate.format( new Date( 1000 * listTimeSleep[1] ) )
        + " hoặc " +intlDate.format( new Date( 1000 * listTimeSleep[2] ) )
        + " hoặc " +intlDate.format( new Date( 1000 * listTimeSleep[3] ) )
        + " hoặc " +intlDate.format( new Date( 1000 * listTimeSleep[4] ) )
        + " hoặc " +intlDate.format( new Date( 1000 * listTimeSleep[5] ) )
    )
  }else {
    showHelp(senderId,name)
  }
}

function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAAEiYFKlCKIBADcN1JelddkX4mnmibsm15cK39hRwLvpxlDcT0wtD4c9KusVRUXeYLRT2WNYKXQkTHVedXDWvqo3QcmsBNWf7yzFaFyS8Rcly64u79Eo1wem6wdoNc9vq5EK6uAjoYsigtX9Y3ZBZBV7jrc48fA9XKz5vtIRLMCNzKW1SSBE9dNYk4w7cZD",
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}


// app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
// app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1");

// server.listen(app.get('port'), app.get('ip'), function() {
//   console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
// });
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log("App is running on port " + port);
});
// var port_number = server.listen(process.env.PORT || 3000);
// app.listen(port_number);