const puppeteer = require('puppeteer')

const saveScreenshot = async (url, path) => {
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()
  page.setViewport({
    width: 1376,
    height: 768
  })
  await page.goto(url)
  await page.screenshot({ path })
  await page.close()
}

module.exports = saveScreenshot
//saveScreenshot('https://www.baidu.com/', './baidu.png')

const autoSubmitForm = async (url, path) => {
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()
  //page.setViewport()
  await page.goto(url, {
    waitUntil: 'networkidle2'
  })
  await page.type('#kw', '大象', {
    delay: 1000
  })
  await page.keyboard.press('Enter')
}

module.exports = autoSubmitForm
//autoSubmitForm('https://www.baidu.com/')
