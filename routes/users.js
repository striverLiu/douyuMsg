var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer')
const { getDouyuRoomInfoByRoomId,getTelArr,sendMail } = require('../uti/util.js')
const config = require('../config/config.js')
var fs = require('fs');
var path = require('path')
var svgCaptcha = require('svg-captcha')
let num = Math.random().toString().slice(-6)

var response = {
  Code: '',
  Msg: '',
  Data: ''
}
/* GET users listing. */
router.post('/getdata', function(req, res, next) {
  var list_data = fs.readFileSync(path.join(__dirname, "../listData.json"))
  list_data = JSON.parse(list_data)
  var obj = {
      phone: req.body.tel,
      roomId: req.body.roomId,
  };
  var zbRoom = req.body.zbRoom

  // 判断是否超出订阅上限
  var isMost = getTelArr()
  var isDy = false
  for(var i in isMost.telList){
    if(req.body.tel == isMost.telList[i].el){
      if(isMost.telList[i].room.length == 6){
          isDy = true
          break;
      }
    }
  }

  if(isDy){
    response.Code = '502'
    response.Msg = '订阅超出上限，一个手机号只允许订阅六个主播'
    response.Data = ''
    res.end(JSON.stringify(response))
    return;
  }


  var tem = false
  if(list_data.list.length >= 1){
    for(var i in list_data.list){
      if(obj.phone == list_data.list[i].phone && obj.roomId == list_data.list[i].roomId){
        tem = true
        break;
      }
    }
    if(tem){
      response.Code = '501'
      response.Msg = '此手机号已订阅过相同主播，请勿重复订阅'
      response.Data = ''
      res.end(JSON.stringify(response))
      return;
    }
  }
  list_data.list.push(obj)
  fs.writeFileSync('listData.json', JSON.stringify(list_data, null, '\t'));
  
  
  response.Code = '200'
  response.Msg = '处理成功'
  response.Data = getTelArr()
  res.end(JSON.stringify(response))


  // 邮件提醒设置
  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(config.transporter)
    // 开启循环监听
    getSMS(transporter)
  })

  function getSMS(transporter){
    // 配置发送邮件信息
    const mailOptions = Object.assign(config.emailDetail, { 
      subject: `新用户关注提醒`, // 邮箱标题
      text: `手机号${obj.phone}斗鱼用户关注了-${zbRoom}-房间号为${obj.roomId}` // 邮箱内容
    })
    // 发送邮件
    sendMail(transporter, mailOptions)
  }
  
  
});

router.post('/search', function(req, res, next) {
	let roomID = req.body.roomID
	getDouyuRoomInfoByRoomId(roomID).then((reslut)=>{
		response.Code = '200'
  	response.Msg = '处理成功'
  	response.Data = reslut.data
  	res.end(JSON.stringify(response))
	}).catch((err)=>{
		response.Code = '500'
  	response.Msg = '系统错误'
  	response.Data = err
  	res.end(JSON.stringify(response))
	})
});

// 发送图形验证码
router.get('/imgCode', function (req, res) {
  var codeConfig = {
    size: 4,// 验证码长度
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
    noise: 5, // 干扰线条的数量
    height: 35,
    width:102
  }
  var captcha = svgCaptcha.create(codeConfig)
  response.Code = '200'
  response.Msg = '处理成功' 
  response.Data = captcha
  res.type('svg');
  res.status(200).end(JSON.stringify(response))
})


// 发送验证码
router.post('/send', function (req, res) {
  /**
   * 云通信基础能力业务短信发送、查询详情以及消费消息示例，供参考。
   * Created on 2017-07-31
   */

  const SMSClient = require('@alicloud/sms-sdk')
  // ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
  const accessKeyId = 'LTAIIIqSAwrSHPKP'
  const secretAccessKey = 'yY4C69LFHRoeL281oief4qorEbUgPg'
  // 初始化sms_client
  let smsClient = new SMSClient({accessKeyId, secretAccessKey})
  // 发送短信
  // console.log(req.body.phone)
  var phone = req.body.tel
  smsClient.sendSMS({
    PhoneNumbers: req.body.tel,
    SignName: '柳建聪',
    TemplateCode: 'SMS_139435277',
    TemplateParam: '{"code": ' + num + ' }'
  }).then(function (respon) {
    let {Code} = respon
    if (Code === 'OK') {
      response.Code = '200'
      response.Msg = '发送成功' 
      response.Data = {
        'phone':phone,
        'num':num
      }
      res.end(JSON.stringify(response))
    }else{
      res.end(JSON.stringify(respon))
    }
  }, function (err) {
    res.end(JSON.stringify(err))
  })
})
module.exports = router;
