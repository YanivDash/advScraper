import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import advMangaWeb from "./contorolers/advMangaWeb.js";
// import { advScraper } from "./advanceScrapper.js";
import websiteScraper from "./pupeteerCherio.js";

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

    allManga.forEach(async (element) => {
      const { href, imgSrc, title } = element;
      result = await advMangaWeb({
        websiteName: href,
        mangaCover: imgSrc,
        mangaName: title,
        mangaClass,
        mangaType,
      });
    });

    return res.status(200).json({ message: result });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the manga." });
  }
});
