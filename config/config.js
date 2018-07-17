const senderEmail = '1140562126@qq.com' // 你的邮箱帐号(发送方)
const receiverEmail = 'jiancong@liveu.xin' // 接收方邮箱帐号(接收方)

module.exports = {
  delayTime: 1000 * 300, // 延迟时间(默认每10秒刷新一次房间信息)
  // 邮件发送器的配置
  transporter: {
    host: 'smtp.qq.com', // smtp域名 (163的smtp域名为 stmp.163.com)
    port: 465, // 端口
    secure: true, // true for 465, false for other ports
    auth: {
      user: senderEmail, // 你的邮箱帐号
      pass: 'izaocofcatzehbde', // 你的邮箱SMTP密码(授权码)
    }
  },
  // 斗鱼房间配置
  douyu: {
    roomApi: `http://open.douyucdn.cn/api/RoomApi/room/`,
    roomId: [ // 斗鱼房间号或者别名
      '1430699' // 房间
    ],
  },
  // TODO: 改为模版
  emailDetail: {
    from: `"手机用户订阅提醒" <${senderEmail}>`, // sender addressss
    to: receiverEmail, // list of receivers
    subject: 'Zard开播了', // Subject line
    text: '没有内容', // plain text body
    // html: '<b>Hello world?</b>' // html body
  }
}