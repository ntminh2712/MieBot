// # SimpleServer
// A simple chat bot server

var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var router = express();
let nodeDate = require('date-and-time');
var moment = require('moment');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
  let currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok'
  });
  moment.locale();

  console.log(currentDate)
  //===========ZIN===========
  var date = moment().format('l');
  var today = new Date()
  var inputTimeHours = 8;
  var text = '8px';
  var integer = parseInt(text, 10);
  var inputTimeMinutes = "00"
  var inputTimeSeconds = "00"
  var typeHour = "AM"

  var tsCurentTime = strToTimestamp(currentDate)
  var tsInputTime = strToTimestamp(date +", "+ inputTimeHours+":"+ inputTimeMinutes+ ":"+inputTimeSeconds + " "+typeHour)

    if (tsCurentTime > tsInputTime){
      var tsInputTime1 = strToTimestamp(today.getMonth()+ 1 +"/"+ (today.getDate().valueOf() + 1) +"/"+
          today.getFullYear() +", "+ inputTimeHours+":"+ inputTimeMinutes+ ":"+inputTimeSeconds + " "+typeHour)

      console.log(today.getMonth()+ 1 +"/"+ (today.getDate().valueOf() + 1) +"/"+
          today.getFullYear() +", "+ inputTimeHours+":"+ inputTimeMinutes+ ":"+inputTimeSeconds + " "+typeHour)

      console.log("Ngay mai luc "+ tsInputTime1 + " may phai day, oc cho" )
    }else {
      console.log("Dung gio "+ inputTimeHours + " hom nay phai day, oc cho" )
    }

});

function strToTimestamp(strDate){
  var datum = Date.parse(strDate);
  return datum/1000;
}


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
  if (message == "help" || message == "Help") {
    showHelp(senderId,name)
  }else if (message == "hello" || message == "Hello"){
    sendMessage(senderId, "Hi, cảm ơn vì tin nhắn của bạn, nếu đây là lần đầu thì gõ \"help\" để xem danh sách câu lệnh nhé!")
  }else
    {
    var option = message.substring(0,6)
    var time = message.substring(7,12)
    var parts = time.split(':');
    var minutes = parts[1]*60+ +parts[0];
    if (option == "sleepy" || option == "Sleepy"|| option == "Sleep"|| option == "sleep") {
      calTimeWakeUp(minutes,senderId,0)
    }else if (option == "wakeup"){
      sendMessage(senderId, "Hi wakeup");
    }else {
      sendMessage(senderId, "Kiểm tra lại câu lệnh của bạn và thử lại sau nhé! Gõ \"help\" để xem danh sách câu lệnh.")
    }
  }
}

function showHelp(senderId,name){
  sendMessage(senderId,"Hi,Hiện tại MieBot mới chỉ có tính năng tính toán thời gian ngủ và thời gian thức dậy.\n\n" +
      "Để tính thời gian thức dậy bắt đầu từ lúc bạn thực hiện câu lệnh hãy trả lời :\n\"sleepy\".\n\n"
      // + "Để tính thời gian muốn thức dậy bạn hãy nhắn tin trả lời : \n\"wakeup + thời gian\", ví dụ \"wakeup 7:00 am\".\n"
      )
}

function calTimeSleep(time) {
  var listTimeSleep = []
  for (var i = 0; i <= 6; i++) {
    var timeSleep = time -  90 * 60 * (i+1) - 14*60
    listTimeSleep.push(timeSleep)
  }
  sendMessage(senderId,"")

}

function calTimeWakeUp(time,senderId,type) {
  if (type == 0) {
    const currentDate = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Bangkok'
    });
    const currentTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Bangkok'
    });
    var listTimeSleep = []
    for (var i = 0; i < 6; i++) {
      var timeSleep = Date.parse(currentDate)/1000 + 90 * 60 * (i + 1 ) + 14 * 60
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
    setTimeout(function(){  sendMessage(senderId, "Chúc bạn ngủ ngon 😘"); }, 3);

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


function timeConverter(UNIX_timestamp){
  var date =new Date(+UNIX_timestamp*1000)
  return date.toLocaleTimeString();
}

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log("App is running on port " + port);
});
