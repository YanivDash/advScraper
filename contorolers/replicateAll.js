import db from "../database/dbConnection.js";
import { scrapeTotal } from "../advanceCherio.js";

const replicateAll = async (values) => {
  const valuesArray = [values.websiteName, values.mangaCover];
  let totalChapterD = 0;
  await scrapeTotal(values.websiteName).then((d) => {
    valuesArray.push(d.totalChapters);
    valuesArray.push(d.firstChapter);
    valuesArray.push(d.lastChapter);
    valuesArray.push(values.id);

    totalChapterD = d.totalChapters;
  });

  if (!totalChapterD || totalChapterD <= 0) {
    let message = "could not scrape total chapter";
    console.log(message);
    return message;
  }

  const sql =
    "UPDATE mangalist SET websiteName = ?, mangaCover = ?, totalChapter = ?, firstChapter = ?, lastChapter = ? WHERE id = ?";
  try {
    const result = await new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting database connection:", err);
          return reject(err);
        }
        connection.query(sql, valuesArray, (error, result) => {
          connection.release();

          if (error) {
            console.error("Error executing the query:", error);
            return reject(error);
          }

          resolve(result);
        });
      });
    });

    if (result) {
      const message = `successfully added to dataBase`;
      console.log("done update");
      return message;
    } else {
      return "check the database";
    }
  } catch (error) {
    console.log(error);
    const message = `error while inserting to database`;
    return message;
  }

  return;
};

export default replicateAll;
