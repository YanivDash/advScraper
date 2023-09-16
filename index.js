import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import advMangaWeb from "./contorolers/advMangaWeb.js";
import { advScraper } from "./advanceScrapper.js";

const port = process.env.PORT || process.env.DB_PORT;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["https://elegant-daifuku-1dd9e4.netlify.app"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.post("/advCreateManga", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Invalid request data." });
    }
    let result = await advMangaWeb(data);

    return res.status(200).json({ message: result });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the manga." });
  }
});

app.post("/advChapter", async (req, res) => {
  try {
    const url = `${req.body.url}`;
    const elemClass = `${req.body.chapClass}`;

    const chapter = await advScraper(url, elemClass);
    res.json(chapter);
  } catch (error) {
    console.log("somthing went wrong");
  }
});

app.listen(port, () => {
  console.log(`port listening on port ${port}`);
});
