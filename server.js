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

var listSuggets = ["Điều chỉnh nhiệt độ phòng. Chuyên gia giấc ngủ cho biết, nhiệt độ phòng khoảng 22 -23 độ C là thích hợp nhất để có giấc ngủ ngon."
  ,"Để tránh tình trạng mệt mỏi, uể oải khi thức giấc, bạn cần điều chỉnh giờ đi ngủ và giờ thức giấc của mình phù hợp sao cho thời điểm bạn thức giấc cũng chính là thời điểm 1 chu kỳ của giấc ngủ kết thúc.",
  "Tránh xa các thiết bị điện tử phát ra ánh sáng xanh. Loại ánh sáng phát ra từ màn hình điện thoại, máy tính chính là 1 nguyên nhân chính dẫn đến chất lượng giấc ngủ kém.",
"Ánh sáng xanh có thể ảnh hưởng tới hormone điều chỉnh giấc ngủ melatonin và khiến cho não luôn trong trạng thái \"nửa tỉnh nửa mê\" thay vì ở trạng thái thư giãn, nghỉ ngơi hoàn toàn.",
"Dựa trên những kiến thức về chu kỳ giấc ngủ, tất cả những gì chúng ta cần làm để ngủ ngon, ngủ sâu là tuân thủ 3 nguyên tắc tối ưu cho các giai đoạn của giấc ngủ: Giảm thời gian ru ngủ và ngủ nông, tăng thời gian ngủ sâu và ngủ rất sâu, tối ưu hóa thời gian ngủ mơ tích cực.",
"Hiểu rõ và điều chỉnh được chu kỳ của giấc ngủ là bí quyết giúp bạn có một giấc ngủ ngon lành và thức dậy sảng khoái dù đi ngủ ở bất cứ thời điểm nào."]
app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");

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
    var time = message.substring(7,14)
    if (option == "sleepy" || option == "Sleepy"|| option == "Sleep"|| option == "sleep") {
      calTimeWakeUp(senderId,0)
    }else if (option == "wakeup"){
      if (time.substring(0,1) >= 0 || time.substring(0,1) <= 12 ||
          time.substring(2,4) >= 0 || time.substring(0,1) <= 59 ||
          time.substring(5,7) == "AM" || time.substring(0,1) == "PM") {
        calTimeSleep(time,senderId)
      }else {
        sendMessage(senderId, "Kiểm tra lại câu lệnh của bạn và thử lại sau nhé! Gõ \"help\" để xem danh sách câu lệnh.")
      }
    }else {
      sendMessage(senderId, "Kiểm tra lại câu lệnh của bạn và thử lại sau nhé! Gõ \"help\" để xem danh sách câu lệnh.")
    }
  }
}

function showHelp(senderId,name){
  sendMessage(senderId,"Hi,Hiện tại MieBot mới chỉ có tính năng tính toán thời gian ngủ và thời gian thức dậy.\n\n" +
      "Để tính thời gian thức dậy bắt đầu từ lúc bạn thực hiện câu lệnh hãy trả lời :\n\"sleepy\".\n\n"
      + "Để tính thời gian muốn thức dậy bạn hãy nhắn tin trả lời : \n\"wakeup + thời gian\", ví dụ \"wakeup 7:00 AM\".\n"
      )
}

function calTimeSleep(time,senderId) {
  let currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok'
  });
  moment.locale();
  var date = moment().format('l');
  var today = new Date()
  var timeConverted = time.replace(" ", ":00 ");
  var tsCurentTime = strToTimestamp(currentDate)
  var tsInputTime = strToTimestamp(date +", "+ timeConverted)
  var timeCal = 0
  if (tsCurentTime > tsInputTime){
    timeCal = strToTimestamp(today.getMonth()+ 1 +"/"+ (today.getDate().valueOf() + 1) +"/"+
        today.getFullYear() +", "+ timeConverted)

  }else {
    timeCal = strToTimestamp(today.getMonth()+ 1 +"/"+ (today.getDate().valueOf()) +"/"+
        today.getFullYear() +", "+ timeConverted)
  }
  var listTimeSleep = []
  for (var i = 0; i <= 6; i++) {
    var timeSleep = timeCal -  90 * 60 * (i + 1) - 14 * 60
    listTimeSleep.push(timeSleep)
  }
  sendMessage(senderId,"Để thức dậy vào lúc: "+time+ " ßßthì bạn nên đi ngủ vào những khung giờ như: \n"
      + timeConverter(listTimeSleep[5])
      + " hoặc " + timeConverter(listTimeSleep[4])
      + " hoặc " + timeConverter(listTimeSleep[3])
      + " hoặc " + timeConverter(listTimeSleep[2])
      + " hoặc " + timeConverter(listTimeSleep[1])
      + " hoặc " + timeConverter(listTimeSleep[0])
  )
  setTimeout(function(){  sendMessage(senderId, listSuggets[Math.floor(Math.random() * listSuggets.length)]) }, 1500);
}

function calTimeWakeUp(senderId,type) {
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
    setTimeout(function(){  sendMessage(senderId, listSuggets[Math.floor(Math.random() * listSuggets.length)]) }, 1500);
    setTimeout(function(){  sendMessage(senderId, "Chúc bạn ngủ ngon 😘"); }, 2500);

  }else {
    showHelp(senderId,name)
  }
}

function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAAEiYFKlCKIBAOz1CspDpEqlh0OIk9YQknVoZAQvegqnzLbXMIqkWIm3QsBLbxMi9QnpexSJoJTBRi3s1ekvBA7cLrbgk72JCfnr3HOBZCzUOKiTKBoePZBquKoeevikOYxEfrNdYbOi1HHBq5jS4f5j9IWt9nWzJaHGZCWeJMUZAlS03jMc0GlnOXvbrTWoZD",
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
