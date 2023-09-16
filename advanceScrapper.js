import puppeteer from "puppeteer";

const advScraper = async (url, elemClass) => {
  let data = [];

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ["--disable-extensions"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`${url}`, {
      waitUntil: "domcontentloaded",
    });

    const imgSrcs = await page.$$eval(`img${elemClass}`, (imgs) => {
      return imgs.map((img) => img.src);
    });

    if (imgSrcs.length > 0) {
      console.log(`elemments with class ${elemClass}`);
      imgSrcs.forEach((src) => data.push(src));
    } else {
      console.log(
        `No img elemments with class ${elemClass} found on the page.`
      );
    }

    return data;
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
};

const scrapeTotal = async (url, elemClass) => {
  let totalChapter = 0;
  const regex = /chapterNumberHere/;

  let leap = 1000;
  let match = 1;
  let newUrl = url.replace(regex, `${match}`);
  let imageUrl;

  while (true) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreDefaultArgs: ["--disable-extensions"],
    });
    console.log("bowser running");
    try {
      const page = await browser.newPage();
      await page.goto(`${newUrl}`, { waitUntil: "domcontentloaded" });

      imageUrl = await page.$eval(`${elemClass}`, (img) => {
        return img ? img.src : null;
      });
      console.log({ data: imageUrl });
    } catch (error) {
      console.log({ match: "error" });
      imageUrl = "";
      browser.close();
    } finally {
      browser.close();
    }

    if (imageUrl) {
      newUrl = url.replace(regex, `${match + leap}`);
      match = match + leap;
      console.log(match);
    } else if (match < 0) {
      console.log(match);
      return match;
    } else if (leap === 1000) {
      newUrl = url.replace(regex, `${match - 1000}`);
      match = match - 1000;
      leap = 500;
    } else if (leap === 500) {
      newUrl = url.replace(regex, `${match - 500}`);
      leap = 100;
      match = match - 500;
    } else if (leap === 100) {
      newUrl = url.replace(regex, `${match - 100}`);
      leap = 10;
      match = match - 100;
    } else if (leap === 10) {
      newUrl = url.replace(regex, `${match - 10}`);
      leap = 1;
      match = match - 10;
    } else {
      totalChapter = match - 1;
      break;
    }
  }

  console.log({ total: totalChapter });
  return totalChapter;
};
export { advScraper, scrapeTotal };
