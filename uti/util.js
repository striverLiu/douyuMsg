const axios = require('axios')
const config = require('../config/config.js')
var fs = require('fs');
var path = require('path')
// 延迟函数
function sleep(ms = 1000 * 300) { // 默认5分钟
  return new Promise(resolve => setTimeout(resolve, ms))
}
// 获取房间信息
function roomInfo(roomId){
  return new Promise((resolve,reject)=>{
    axios.get(config.douyu.roomApi + roomId).then((res)=>{
      resolve(res.data)
    }).catch((err)=>{
      reject(err)
    })
  })
}
// 根据斗鱼房间号,判断是否在开播状态
function isOnStream(roomId) {
  return axios.get(config.douyu.roomApi + roomId).then((res) => {
    const responseData = res.data
    if (responseData.error != '0') {
      console.log('请求错误')
      // TODO: 错误处理
      return false
    }
    // 判断是否在开播状态
    // 1 - 开播 , 2 - 未开播
    if (responseData.data.room_status != 1) {
      return false
    }
    return true
  })
}
// 通过RoomId,获取斗鱼房间信息
function getDouyuRoomInfoByRoomId(roomId) {
  try {
    return axios.get(config.douyu.roomApi + roomId)
  } catch (error) {
    throw error
  }
}
// 获取RoomId列表上,所有斗鱼房间信息
function getAllDouyuRoomInfoPromise(roomIdArray = config.douyu.roomId) {
  let douyuRoomInfoPromiseArray = []
  for (let roomId of roomIdArray) {
    douyuRoomInfoPromiseArray.push(getDouyuRoomInfoByRoomId(roomId))
  }
  return Promise.all(douyuRoomInfoPromiseArray)
}
// 发送邮件
function sendMail(transporter, mailOptions) {
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message sent: %s', info.messageId)
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
  })
}



// 立即执行函数，获取一个手机号关注的主播，跟一个主播有多少手机号
function getTelArr(){
  try {
    
  // 获取信息列表
var telList = fs.readFileSync(path.join(__dirname, "../telList.json"))
    telList = JSON.parse(telList)
var listData = fs.readFileSync(path.join(__dirname, "../listData.json"))
    listData = JSON.parse(listData)

  var temNewArr = []
  for(var j in listData.list){
    let temObject = {
      'room':[],
      'tel':''
    }
    temObject.tel = listData.list[j].phone
    for(var h in listData.list){
      if(listData.list[j].phone == listData.list[h].phone){
        temObject.room.push(listData.list[h].roomId)
      }
    }
    temNewArr.push(temObject)
  }
  
  var finArr = unRepeatObject(temNewArr)
    /**
     * 数组对象去重
     * @param {Array} arr 数组
     * @return {Array} newArr 数组
     */
    function unRepeatObject(arr){
      var tmepArr = [];
      // 将数组对象转成数组字符串
      var newStr = changeArrStr(arr);
      newStr.sort();
      // 数组去重
      for(var i=0;i<newStr.length;i++){
        if(newStr[i] !== tmepArr[tmepArr.length-1]){
          tmepArr.push(newStr[i]);
        }
      }
      var newArr = [];
      // 新数组字符串转成数组对象
      for(var i=0;i<tmepArr.length;i++){
        newArr.push(JSON.parse(tmepArr[i]));
      }
      return newArr;
    }
    /**
     * 数组内容对象转成字符串,去空,排序
     * @param {Object} arr
     * @return {Array} newArr
     */
     
    function changeArrStr(arr){
      var newArr = [];
      if(arr.length !== 0){
        for(var i=0;i<arr.length;i++){
          var thisObj = sortObjectFun(arr[i]);
          var thisStr = JSON.stringify(thisObj);
          thisStr = thisStr.replace(/(\s|[\\t])/g,''); // 去除空格及\t空白字符
          newArr.push(thisStr);
        }
      }
      return newArr;
    }
    /**
     * 对象排序
     * @param {Object} obj
     * @return {Object} newObj
     */
    function sortObjectFun(obj){
      var keyArr = [];// 对象的key
      for(var item in obj){
        keyArr.push(item);
      };
      keyArr.sort(); // 降序
      var newObj = {};
      for(var i=0;i<keyArr.length;i++){
        newObj[keyArr[i]] = obj[keyArr[i]]
      }
      return newObj;
    }
  telList.list = finArr
  fs.writeFileSync('telList.json', JSON.stringify(telList, null, '\t'));
  allArrObject = {
    'allList':listData.list,
    'telList':telList.list
  }
    
  return allArrObject
  } catch (error) {
    throw error
  }
};








// 发送短信
function sendMsg(val,alltel){
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
  var num = val
  console.log(alltel)
  alltel.forEach((item)=>{
    tem(item)
  })
  
  function tem(phone){
    smsClient.sendSMS({
      PhoneNumbers: ''+phone+'',
      SignName: '柳建聪',
      TemplateCode: 'SMS_138069306',
      TemplateParam: '{"name": "'+num+'" }'
      // TemplateParam: '{"name": "--蔚好涵whh--" }'
    }).then(function (respon) {
      console.log(respon)
      const senderEmail = '1140562126@qq.com' // 你的邮箱帐号(发送方)
      const receiverEmail = 'jiancong@liveu.xin' // 接收方邮箱帐号(接收方)
      // 模板消息
      /*emailDetail: {
        from: `"斗鱼tv开播提醒" <${senderEmail}>`, 
        to: receiverEmail, 
        subject: 'Zard开播了', 
        text: '没有内容', 
        // html: '<b>Hello world?</b>' 
      }*/
      // 发送邮件
      // sendMail(transporter, emailDetail)
    }, function (err) {
      // res.end(JSON.stringify(err))
      console.log(err)
    })
  }
}
module.exports = {
  sleep,
  isOnStream,
  getDouyuRoomInfoByRoomId,
  getAllDouyuRoomInfoPromise,
  sendMail,
  sendMsg,
  getTelArr
}