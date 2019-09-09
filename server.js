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
  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok'
  });
  var listTimeSleep = []
  for (var i = 0; i < 6; i++) {
    var timeSleep = Date.parse(currentTime) + 90*60 * (i+1) + 14*60
    listTimeSleep.push(timeSleep)
  }
  console.log(listTimeSleep.length)
  console.log(listTimeSleep)
  console.log("Bây giờ là " + currentTime +". Nếu bạn lên giường và đi ngủ ngay, thì bạn nên thức dậy vào những khoảng thời gian: \n"
      + timeConverter(listTimeSleep[0])
      + " hoặc " + timeConverter(listTimeSleep[1])
      + " hoặc " + timeConverter(listTimeSleep[2])
      + " hoặc " + timeConverter(listTimeSleep[3])
      + " hoặc " + timeConverter(listTimeSleep[4])
      + " hoặc " + timeConverter(listTimeSleep[5])
  )
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
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var hour = a.getHours();
  var min = a.getMinutes();
  var time = hour + ':' + min ;
  return time;
}
function handlerMessage(message, senderId,name) {
  if (message == "help") {
    showHelp(senderId,name)
  }else {
    var option = message.substring(0,6)
    var time = message.substring(7,12)
    var parts = time.split(':');
    var minutes = parts[1]*60+ +parts[0];
    if (option == "sleepy") {
      calTimeWakeUp(minutes,senderId,0)
      sendMessage(senderId, "Chúc bạn ngủ ngon 😘");
    }else if (option == "wakeup"){
      sendMessage(senderId, "Hi wakeup");
    }else {
      sendMessage(senderId, "Kiểm tra lại câu lệnh của bạn và thử lại sau nhé! Gõ \"help\" để xem danh sách câu lệnh.")
    }
  }
}

function showHelp(senderId,name){
  sendMessage(senderId,"Hi,Hiện tại MieBot mới chỉ có tính năng tính toán thời gian ngủ và thời gian thức dậy.\n\n" +
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
    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Bangkok'
    });
    var listTimeSleep = []
    for (var i = 0; i < 6; i++) {
      var timeSleep = Date.parse(currentTime) + 90*60 * (i+1) + 14*60
      listTimeSleep.push(timeSleep)
    }
    sendMessage(senderId, "Bây giờ là " + currentTime +". Nếu bạn lên giường và đi ngủ ngay, thì bạn nên thức dậy vào những khoảng thời gian: \n"
        + timeConverter(listTimeSleep[0])
        + " hoặc " + timeConverter(listTimeSleep[1])
        + " hoặc " + timeConverter(listTimeSleep[2])
        + " hoặc " + timeConverter(listTimeSleep[3])
        + " hoặc " + timeConverter(listTimeSleep[4])
        + " hoặc " + timeConverter(listTimeSleep[5])
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

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log("App is running on port " + port);
});
// var port_number = server.listen(process.env.PORT || 3000);
// app.listen(port_number);