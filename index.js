const xlsx = require('node-xlsx').default
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
//const run = require('./server')
const puppeteer = require('puppeteer')

const DATE_R = /^[1-9]\d{3}-\d{2}-\d{2}$/
const BASE_URL = 'http://www.chinamoney.com.cn/fe-c/PledgeRepoDailySearchAction.do?remarkBondType=262&langCode=ZH&searchDate='
const R001__RATE = `body .market-new-text:nth-child(3) tbody > tr:nth-child(3) table tbody > tr:nth-child(3) > td:nth-child(4)`
const R001_AMOUNT = `body .market-new-text:nth-child(3) tbody > tr:nth-child(3) table tbody > tr:nth-child(3) > td:nth-child(9)`
const R007__RATE = `body .market-new-text:nth-child(3) tbody > tr:nth-child(3) table tbody > tr:nth-child(4) > td:nth-child(4)`
const R007_AMOUNT = `body .market-new-text:nth-child(3) tbody > tr:nth-child(3) table tbody > tr:nth-child(4) > td:nth-child(9)`

const fetchUrl = date => `${BASE_URL}${date}`

!Date.prototype.format && (Date.prototype.format = function (fmt) {
  var format = fmt || "yyyy-MM-dd HH:mm:ss", year = this.getFullYear(),
    month = this.getMonth() + 1, date = this.getDate(),
    hour = this.getHours(), min = this.getMinutes(), second = this.getSeconds(), t = hour > 11 ? "PM" : "AM",
    joint = function (num) {
      return num < 10 ? ("0" + num) : num;
    };
  return format.replace(/[y]{4}/g, year)
    .replace(/[y]{2}/g, (year + "").substring(2))
    .replace(/[M]{2}/g, joint(month))
    .replace(/[M]{1}/g, month)
    .replace(/[d]{2}/g, joint(date))
    .replace(/[d]{1}/g, date)
    .replace(/[H]{2}/g, joint(hour))
    .replace(/[h]{2}/g, joint(hour % 12))
    .replace(/[m]{2}/g, joint(min))
    .replace(/[s]{2}/g, joint(second))
    .replace(/[t]{2}/g, t)
    .replace(/[t]{1}/g, t.substring(0, 1));
});

const server = async (date) => {
  console.log(date)
  let url = fetchUrl(date)

  const browser = await puppeteer.launch({
    //headless: false
  })
  const page = await browser.newPage()
  await page.goto(url, {
    waitUntil: 'networkidle2'
  })

  let r001Rate = await page.evaluate((sel) => {
    let element = document.querySelector(sel)
    return element ? element.innerHTML : ''
  }, R001__RATE)

  let r001Amount = await page.evaluate((sel) => {
    let element = document.querySelector(sel)
    return element ? element.innerHTML : ''
  }, R001_AMOUNT)

  let r007Rate = await page.evaluate((sel) => {
    let element = document.querySelector(sel)
    return element ? element.innerHTML : ''
  }, R007__RATE)

  let r007Amount = await page.evaluate((sel) => {
    let element = document.querySelector(sel)
    return element ? element.innerHTML : ''
  }, R007_AMOUNT)

  browser.close()

  return {
    r001Rate: r001Rate,
    r001Amount: r001Amount,
    r007Rate: r007Rate,
    r007Amount: r007Amount
  }
}


let startDate = new Date('2016-01-01')
let now = new Date()

const run = async () => {
  while (startDate <= now) {
    let dateString = startDate.format('yyyy-MM-dd')
    let data = await server(dateString)
    console.log(data)

    const r001File = xlsx.parse(`${__dirname}/R001.xlsx`)
    let r001FileData = r001File[0].data
    r001FileData.push([dateString, data.r001Rate, data.r001Amount])
    let r001Buffer = xlsx.build([{name:'Sheet1', data: r001FileData}])
    fs.writeFileSync(`${__dirname}/R001.xlsx`, r001Buffer, {'flag':'w'})

    const r007File = xlsx.parse(`${__dirname}/R007.xlsx`)
    let r007FileData = r007File[0].data
    r007FileData.push([dateString, data.r007Rate, data.r007Amount])
    let r007Buffer = xlsx.build([{name:'Sheet1', data: r007FileData}])
    fs.writeFileSync(`${__dirname}/R007.xlsx`, r007Buffer, {'flag':'w'})

    startDate = new Date(startDate.setDate(startDate.getDate() + 1))
  }
}

run()