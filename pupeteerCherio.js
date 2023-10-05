import puppeteer from "puppeteer";
import cheerio from "cheerio";

const websiteScraper = async (url, nextSelecter, blockClass) => {
  console.log(url, nextSelecter, blockClass);
  let data = [];
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ["--disable-extensions"],
    headless: false,
  });

  let scrapedLinks = [];

  try {
    const page = await browser.newPage();
    await page.goto(`${url}`, {
      waitUntil: "domcontentloaded",
    });

    while (true) {
      const pageContent = await page.content();
      const $ = cheerio.load(pageContent);

      $(blockClass).each((index, element) => {
        scrapedLinks.push($(element));
      });
      const nextButton = $(nextSelecter);
      if (nextButton.length === 0 || !nextButton) {
        break;
      }
      await page.click(nextSelecter);
      await page.waitForTimeout(2000);
    }
  } catch (error) {
    console.log("no more clicks");
  } finally {
    await browser.close();

    for (const $element of scrapedLinks) {
      const href = $element.find("a").attr("href");

      const imgSrc = $element.find("img").attr("src");

      let title = $element.find("h4 a").html()?.toLowerCase();
      if (!title) {
        title = $element.find("h4").html()?.toLowerCase();
      }

      if (!title) {
        title =
          $element.find("h3 a").html()?.toLowerCase() ||
          $element.find("h3").html()?.toLowerCase();
        if (!title) {
          title =
            $element.find("h2 a").html()?.toLowerCase() ||
            $element.find("h2").html()?.toLowerCase();
        }
      }

      data.push({ href, imgSrc, title });
    }
  }

  const uniqueTitles = {};
  const filteredData = data.filter((item) => {
    if (!uniqueTitles[item.title]) {
      uniqueTitles[item.title] = true;
      return true;
    }
    return false;
  });

  return filteredData;
};

export default websiteScraper;
