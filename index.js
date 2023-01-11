const playwright = require("playwright");
const wordcut = require("wordcut");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
wordcut.init();
const fs = require("fs");

const data = [];
const keywords = "รองเท้าผู้ชาย";

async function main() {
  let stop = false;

  async function getProducts(i) {
    const browser = await playwright.chromium.launch({
       // browser microsoft edge
      headless: false,
  
    });
   
     
    const page = await browser.newPage();
    i > 0 ? await page.goto(`https://shopee.co.th/search?keyword=${keywords}&page=${i}`) : await page.goto(`https://shopee.co.th/search?keyword=${keywords}`);

    await page.waitForTimeout(5000);

    const empty = await page.$$("div.shopee-search-empty-result-section");

    if (empty.length > 0) {
      stop = true;
      console.log("stop");
      browser.close();
      return;
    } else {
      const products = await page.$$("div.shopee-search-item-result__item");
      await page.evaluate(() => {
        document.body.style.zoom = "10%";
      });

      for (let product of products) {
        const name = await product.$eval("a > div > div > div.KMyn8J > div.dpiR4u > div > div",(el) => el.innerText)
        const price = await product.$eval("a > div > div > div.KMyn8J > div.hpDKMN",(el) => el.innerText);
        const sold = await product.$eval("a > div > div > div.KMyn8J > div.ZnrnMl",(el) => el.innerText);
        const link = await product.$eval("a", (el) => el.href);
        data.push({ 
          name: name.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|⭐)/g, ''),
          price, 
          sold, 
          link });
      }
      console.log(data.length);
     // await page.screenshot({ path: `screenshot${i}.png` });
      await browser.close();
    }
  }

  let i = 0;
  while (true) {
    if (stop) break;
    await getProducts(i);
    i++;
  }
}

main().then(() => {
  // let setData = [];

  // async function set() {
  //   data.forEach((item) => {
  //     if (item.name.includes(keywords)) {
  //       setData.push({
  //         name: wordcut.cut(item.name),
  //         price: item.price,
  //         sold: item.sold,
  //         link: item.link,
  //       });
  //     }
  //   });
  // }

  // // create csv file
  // set().then(() => {
  //   const csvWriter = createCsvWriter({
  //     path:  keywords + ".csv",
  //     header: [
  //       { id: "name", title: "name" },
  //       { id: "price", title: "price" },
  //       { id: "sold", title: "sold" },
  //       { id: "link", title: "link" },
  //     ],
  //   });

  //   csvWriter.writeRecords(setData).then(() => {
  //     console.log("...Done");
  //   });

  // });
      

  const csvWriter = createCsvWriter({
    path: keywords + ".csv",
    header: [
      { id: "name", title: "name" },
      { id: "price", title: "price" },
      { id: "sold", title: "sold" },
      { id: "link", title: "link" },
    ],
  });

  csvWriter.writeRecords(data).then(() => {
    console.log("...Done");
  });

  // create json file utf-8
  fs.writeFile(keywords + ".json", JSON.stringify(data), "utf8", (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("...Done");
    }
  });
 



});
