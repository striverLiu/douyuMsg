const nodemailer = require('nodemailer')

const { sleep, getAllDouyuRoomInfoPromise, sendMail,sendMsg } = require('./uti/util.js')
const config = require('./config/config.js')
var fs = require('fs');
var path = require('path')


// var listArr = []
var listObj = {}
function getArr(){
	// 立即执行函数，获取所有的房间号并判断是否开播状态
	var listData = fs.readFileSync(path.join(__dirname, "./listData.json"))
    	listData = JSON.parse(listData)
  var temArr = [];
	if(listData.list.length > 0){
		for(var i in listData.list){
	    temArr.push(listData.list[i].roomId)
	  }
	}
  function unique(arr){
	  var newArr = [];
	  arr.forEach(function(item){
	    if(newArr.indexOf(item) === -1){
	      newArr.push(item);
	    }
	  });
	  return newArr;
	}

	listObj = {
    'listArr':unique(temArr),
    'allData':listData
  }

};



let preStreamState = {} // 主播之前的开播状态

nodemailer.createTestAccount((err, account) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(config.transporter)
  // 开启循环监听
  monitor(transporter)
})


// 监听房间状态
async function monitor(transporter) {
	getArr();
  // console.log(listObj.allData.list)
  try {
    console.log(listObj.listArr)
    const resultArray = await getAllDouyuRoomInfoPromise(listObj.listArr)
    for (let value of resultArray) {
      const { data: { data: roomInfo, error: errorCode } } = value
      // 判断状态
      if (errorCode !== 0 ) {
        throw new Error(roomInfo)
      }
      // 判断是否开播
      // "1" - 开播 , "2" - 未开播
      if (roomInfo.room_status === '1') {
        var temTelArr = []
          var getTel = listObj.allData.list
          for(var i in getTel){
            if(roomInfo.room_id == getTel[i].roomId){
              temTelArr.push(getTel[i].phone)
            }
          }
        console.log(`${roomInfo.owner_name} ---- 已经开播 ---- ${roomInfo.start_time}`)
        if (!preStreamState[roomInfo.room_id]) {
          // 配置发送邮件信息
          // const mailOptions = Object.assign(config.emailDetail, { 
          //   subject: roomInfo.owner_name, // 邮箱标题
          //   text: roomInfo.room_name + roomInfo.start_time // 邮箱内容
          // })
          // 发送邮件
          // sendMail(transporter, mailOptions)
          
          // 获取订阅的手机号
          
          sendMsg(`${roomInfo.owner_name}`,temTelArr)
          preStreamState[roomInfo.room_id] = true
        }
      } else {
        console.log(`${roomInfo.owner_name} ---- 未开播 ---- 上次开播时间 ---- ${roomInfo.start_time}`)
        preStreamState[roomInfo.room_id] = false

      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    // 隔一段时间再请求
    await sleep(config.delayTime)
    return monitor(transporter)
  }
}

// 后台的路由模板引擎

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);


app.listen(5050, function () {
  console.log('应用实例，访问地址为 http://localhost:5050')
})

