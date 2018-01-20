const puppeteer = require('puppeteer');
const xlsx = require('node-xlsx').default;
const fs = require('fs');

let columns = [
  '市场参与者类别',
  '合计持有市值',
  '合计占比',
  '国债',
  '地方政府债',
  '金融债',
  '企业债',
  '中小企业私募债',
  '公司债',
  '非公开发行',
  '可转换',
  '可分离',
  '企业资产支持',
  '信贷资产支持',
  '可交换',
  '其他'
];

const getMonthData = async (year, month) => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://bond.sse.com.cn/data/statistics/monthly/mainbond/', {
    waitUntil: 'networkidle2'
  });

  async function setSelectVal(sel, val) {
    page.evaluate((data) => {
      return document.querySelector(data.sel).value = data.val
    }, {sel, val})
  }

  await setSelectVal('#year', year);
  await setSelectVal('#month', month);
  await page.click('.search-btn');
  await page.waitForSelector('#basic_data_container tbody > tr:nth-child(2) > td:nth-child(2)');

  let data = [];
  data.push([`${year}年${month}月`]);
  data.push(columns);

  for (let i = 2; i <= 13; i ++) {
    let row = [];
    for (let j = 1; j <= 16; j ++) {
      let value = await page.$eval(`#basic_data_container tbody > tr:nth-child(${i}) > td:nth-child(${j})`, el => el.innerHTML);
      row.push(value);
    }
    data.push(row)
  }
  data.push([], []);

  browser.close()
  
  return data;
};

const run = async () => {
  let result = [];
  for (let year = 2016; year <= 2017; year ++) {
    let month = (year == 2016) ? 7 : 1;
    for (month; month <= 12; month ++) {
      try {
        let monthData = await getMonthData(year, month);
        result = result.concat(monthData);
      } catch {
        //
      }
      console.log(`${year}-${month}`);
    }
  }
  let buffer = xlsx.build([{name:'Sheet1', data: result}])
  fs.writeFileSync(`${__dirname}/ssebond.xlsx`, buffer, {'flag':'w'})
}
run()