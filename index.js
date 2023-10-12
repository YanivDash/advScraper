import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import advMangaWeb from "./contorolers/advMangaWeb.js";
// import { advScraper } from "./advanceScrapper.js";
import websiteScraper from "./pupeteerCherio.js";
import getAllManga from "./contorolers/getAllManga.js";
import updateTotalChapter from "./contorolers/updateTotalChapter.js";
import { updateChapter } from "./advanceCherio.js";
import cron from "node-cron";
import deleteDuplicate from "./contorolers/delete.js";
import replicateAll from "./contorolers/replicateAll.js";

dotenv.config();

const port = process.env.PORT || process.env.DB_PORT;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://manganexus-library.netlify.app"
  );
  next();
});
app.use(
  cors({
    origin: ["https://manganexus-library.netlify.app"],
    methods: ["POST", "GET", "DELETE"],
    credentials: true,
  })
);

app.post("/advCreateManga", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Invalid request data." });
    }
    const { url, blockClass, nextSelecter, mangaType, mangaClass } = data;
    let allManga = await websiteScraper(url, nextSelecter, blockClass);

    let result;

    for (const element of allManga) {
      const { href, imgSrc, title } = element;

      result = await advMangaWeb({
        websiteName: href,
        mangaCover: imgSrc,
        mangaName: title,
        mangaClass,
        mangaType,
      });
    }

    return res.status(200).json({ message: result });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the manga." });
  }
});

const chapterUpdate = async () => {
  try {
    const data = await getAllManga();

    if (!data || data.length <= 0) {
      console.log("no data found in database");
      return res.status(400).json({ error: "Invalid request data." });
    }
    for (const element of data) {
      const { id, websiteName, totalChapter } = element;
      let newTotalChapter = await updateChapter(websiteName);

      await updateTotalChapter({
        id,
        newTotalChapter,
        totalChapter,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};

cron.schedule("8 17 * * *", (err) => {
  console.log("Running API request...");
  chapterUpdate();
});

app.delete("/deleteDuplicate", async (req, res) => {
  try {
    const data = await getAllManga();
    if (!data || data.length <= 0) {
      console.log("no data found in database");
      return res.status(400).json({ error: "Invalid request data." });
    }

    let titleArray = [];
    let duplicate = [];
    data.forEach((element) => {
      if (titleArray.includes(element.mangaName.toLowerCase())) {
        duplicate.push(element);
      } else {
        titleArray.push(element.mangaName.toLowerCase());
      }
    });

    console.log(duplicate);

    for (const element of duplicate) {
      await deleteDuplicate(element.id);
    }

    return res.status(200).json({ messgae: "deleted all duplicates" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ error: "error while deleting" });
  }
});

app.put("replicateAll", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    const mangaData = await getAllManga();
    if (!data || data.length <= 0) {
      console.log("no data found in database");
      return res.status(400).json({ error: "Invalid request data." });
    }

    const { url, blockClass, nextSelecter } = data;

    let allManga = await websiteScraper(url, nextSelecter, blockClass);

    let result;

    for (const element of allManga) {
      const { href, imgSrc, title } = element;

      for (const obj of mangaData) {
        if (title === obj.mangaName) {
          result = await replicateAll({
            websiteName: href,
            mangaCover: imgSrc,
            id: obj.id,
          });
          break;
        }
      }
    }

    return res.status(200).json({ message: result });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the manga." });
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
