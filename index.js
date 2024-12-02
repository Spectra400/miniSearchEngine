const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// In-memory storage for articles
let articles = [];
const articlesFile = "articles.json";

// Load articles from file if available
if (fs.existsSync(articlesFile)) {
  articles = JSON.parse(fs.readFileSync(articlesFile, "utf-8"));
}

// Endpoint to add a new article
app.post("/articles", (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content || !tags) {
    return res.status(400).json({ error: "Title, content, and tags are required." });
  }

  const newArticle = {
    id: articles.length + 1,
    title,
    content,
    tags,
    createdAt: new Date(),
  };

  articles.push(newArticle);

  // Save to file
  fs.writeFileSync(articlesFile, JSON.stringify(articles, null, 2));

  res.status(201).json(newArticle);
});

// Endpoint to search articles
app.get("/articles/search", (req, res) => {
  const { keyword, sortBy = "relevance" } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required for searching." });
  }

  // Filter articles by keyword in title or content
  const results = articles
    .filter(
      (article) =>
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.content.toLowerCase().includes(keyword.toLowerCase())
    )
    .map((article) => {
      const keywordCount =
        (article.title.toLowerCase().split(keyword.toLowerCase()).length - 1) +
        (article.content.toLowerCase().split(keyword.toLowerCase()).length - 1);
      return { ...article, relevance: keywordCount };
    });

  // Sort results by relevance or date
  if (sortBy === "relevance") {
    results.sort((a, b) => b.relevance - a.relevance);
  } else if (sortBy === "date") {
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(results);
});

// Endpoint to get article by ID
app.get("/articles/:id", (req, res) => {
  const { id } = req.params;
  const article = articles.find((a) => a.id === parseInt(id));

  if (!article) {
    return res.status(404).json({ error: "Article not found." });
  }

  res.json(article);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
