const scrapeTotal = async (url) => {
  const elemClass = "a[href*=chapter]";
  let data = [];

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const totalLink = $(elemClass);
    totalLink.each(async (index, element) => {
      const link = $(element).attr("href");
      data.push(link);
    });

    data = Array.from(new Set(data));

    function extractNumberFromLink(link) {
      const re = /chapter[\W0-9]*[a-z]|chapter.*/gi;
      const newStr = link.match(re)[0];
      const reg = /\d+/g;
      const num = newStr
        .match(reg)
        ?.sort((a, b) => parseInt(b) - parseInt(a))[0];
      if (num >= 0) {
        return num;
      } else {
        return -1;
      }
    }

    data.sort((a, b) => extractNumberFromLink(b) - extractNumberFromLink(a));

    while (true) {
      const re = /chapter.*/gi;
      const newStr = data[data.length - 1].match(re)[0];
      const reg = /\d+/g;
      const num = newStr.match(reg);
      if (!num) {
        console.log(data.splice(-1));
      } else {
        break;
      }
    }

    const regex = /https|http/g;
    const isDomain = data[0].match(regex);
    if (!isDomain) {
      const reg = /https:\/+.[a-z0-9.]*/gi;
      const domain = url.match(reg)[0];
      data[data.length - 1] = `${domain}${data[data.length - 1]}`;
      data[0] = `${domain}${data[0]}`;
    }

    if (data.length > 3) {
      console.log({
        totalChapters: data.length,
        firstChapter: data[data.length - 1],
        lastChapter: data[0],
      });
      return {
        totalChapters: data.length,
        firstChapter: data[data.length - 1],
        lastChapter: data[0],
      };
    } else {
      return "failed to load chapters";
    }
  } catch (error) {
    console.log(error);
    return "error in scrapper.js : scrapeTotal";
  }
};

export { scrapeTotal };
