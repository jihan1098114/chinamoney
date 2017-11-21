const puppeteer = require('puppeteer')

const BASE_URL = 'http://www.chinamoney.com.cn/fe-c/PledgeRepoDailySearchAction.do?remarkBondType=262&langCode=ZH&searchDate='
const fetchUrl = date => `${BASE_URL}${date}`

const R001__RATE = `body .market-new-text:nth-child(3) tbody > tr:nth-child(3) table tbody > tr:nth-child(3) > td:nth-child(4)`
const R001_AMOUNT = `body .market-new-text:nth-child(3) tbody > tr:nth-child(3) table tbody > tr:nth-child(3) > td:nth-child(9)`
const R007__RATE = `body .market-new-text:nth-child(3) tbody > tr:nth-child(3) table tbody > tr:nth-child(4) > td:nth-child(4)`
const R007_AMOUNT = `body .market-new-text:nth-child(3) tbody > tr:nth-child(3) table tbody > tr:nth-child(4) > td:nth-child(9)`

const run = async (date) => {
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
  //await page.close()
}

module.exports = run

let startDate = new Date('2017-11-01')
let now = new Date()

const test = async () => {
  while (startDate <= now) {
    let dateString = startDate.format('yyyy-MM-dd')
    let res = await run(dateString)
    console.log(res)
    startDate = new Date(startDate.setDate(startDate.getDate() + 1))
  }
}
test()