import db from "../database/dbConnection.js";
import { totalChapterLinks } from "../advanceScrapper.js";

const advMangaWeb = async (values) => {
  const valuesArray = [
    values.websiteName,
    values.mangaName,
    values.mangaCover,
    values.mangaLink,
    values.mangaClass,
  ];
  let totalChapterD = 0;
  await totalChapterLinks(values.websiteName, values.mangaClass).then((d) => {
    valuesArray.push(d.totalChapters);
    valuesArray.push(d.firstChapter);
    valuesArray.push(d.lastChapter);
    totalChapterD = d.totalChapters;
  });

  let message;

  if (totalChapterD < -1 || totalChapterD > 5500) {
    message = "could not scrape total chapter";
    console.log(message);
    return message;
  }

  const sql = `INSERT INTO mangalist (\`websiteName\`, \`mangaName\`, \`mangaCover\`, \`mangaLink\`, \`mangaClass\`,\`totalChapter\`,\`firstChapter\`,\`lastChapter\`)VALUES (?, ?, ?, ?, ?, ? , ? , ?)`;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(sql, valuesArray, (err, result) => {
        if (result) {
          resolve(result);
        } else {
          reject("error");
        }
      });
    });

    if (result) {
      const message = `successfully added to dataBase`;
      console.log(result);
      return message;
    }
  } catch (error) {
    const message = `error while inserting to database`;
    return message;
  }

  return;
};

export default advMangaWeb;
