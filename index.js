const xlsx = require('node-xlsx').default
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const run = require('./fetch-data')

// const workSheetsFromFile = xlsx.parse(`${__dirname}/R001.xlsx`)
// console.log(workSheetsFromFile)
const DATE_R = /^[1-9]\d{3}-\d{2}-\d{2}$/

!Date.prototype.format && (Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S": this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
})

let startDate = process.argv[2]
let endDate = process.argv[3]
// if (!DATE_R.test(startDate) || !DATE_R.test(endDate)) {
//   console.log('无效的日期')
//   process.exit()
// }
let startDateStamp = new Date(startDate)
let endDateStamp = new Date(endDate)
let r001Data = [['日期', '加权利率(%)', '成交金额（亿元）']]
let r007Data = [['日期', '加权利率(%)', '成交金额（亿元）']]

while (startDateStamp <= endDateStamp) {
  let dateString = new Date(startDateStamp).format('yyyy-MM-dd')
  run(dateString).then(data => {
    // r001Data.push([dateString, data.r001Rate, data.r001Amount])
    // r007Data.push([dateString, data.r007Rate, data.r007Amount])
    const r001File = xlsx.parse(`${__dirname}/R001.xlsx`)
    let r001FileData = Array.prototype.slice.call(r001File[0].data)
    r001FileData.push([dateString, data.r001Rate, data.r001Amount])
    let r001Buffer = xlsx.build([{name:'Sheet1', data: r001FileData}])
    fs.writeFileSync(`${__dirname}/R001.xlsx`, r001Buffer, {'flag':'w'})

    const r007File = xlsx.parse(`${__dirname}/R007.xlsx`)
    let r007FileData = Array.prototype.slice.call(r007File[0].data)
    r007FileData.push([dateString, data.r007Rate, data.r007Amount])
    let r007Buffer = xlsx.build([{name:'Sheet1', data: r007FileData}])
    fs.writeFileSync(`${__dirname}/R007.xlsx`, r007Buffer, {'flag':'w'})
  })
  startDateStamp = new Date(startDateStamp.setDate(startDateStamp.getDate() + 1))
}

// console.log(r001Data)