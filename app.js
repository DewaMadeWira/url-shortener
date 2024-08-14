const Pool = require("pg").Pool;
const shortid = require("shortid");

require("dotenv").config();

const credentials = {
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.PASSWORD,
  port: 6543,
};

const pool = new Pool(credentials);

const getUrl = (request, response) => {
  pool.query("SELECT * FROM url ", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};
const getShortUrl = (request, response) => {
  pool.query(
    "SELECT * FROM url where short_url = $1",
    [request.params.shortUrl],
    (error, results) => {
      if (error) {
        throw error;
      }
      // return response.json(results.rows[0]);
      if (results.rows[0] != null) {
        return response.json({ full_url: results.rows[0].full_url });
      }
      return response.json({ full_url: "" });
    }
  );
};
const postUrl = (request, response) => {
  const fullUrl = request.body.fullUrl;
  const shortUrl = shortid();
  pool.query(
    "INSERT INTO url(full_url, short_url) VALUES ($1, $2) RETURNING * ",
    [fullUrl, shortUrl],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).json({ short_url: results.rows[0].short_url });
    }
  );
};

module.exports = { getUrl, postUrl, getShortUrl };

const express = require("express");

// const db = require("./database").default;

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

var options = {
  swaggerDefinition: {
    info: { title: "URL Shortener App", version: "1.1.0" },
  },
  apis: ["app.js"],
  swaggerOptions: {
    validatorUrl: null,
  },
};

const swaggerDocs = swaggerJsDoc(options);

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const app = express();
app.use(express.json());

var cors = require("cors");
app.use(cors());

app.set("view engine", "ejs");

// Allow URL Encoded
app.use(express.urlencoded({ extended: true }));

// app.use(
//     '/api-docs',
//     swaggerUI.serve,
//     swaggerUI.setup(swaggerDocs, { customCssUrl: CSS_URL })
// );

// Static Files for Images
app.use(express.static("public"));

// /**
//  * @swagger
//  * /:
//  *   get:
//  *     summary: Returns all URLs
//  *     tags: [URLs]
//  *     responses:
//  *       200:
//  *         description: the list of all URLs
//  */
app.get("/", async (req, res) => {
  getUrl(req, res);
});

app.get("/:shortUrl", async (req, res) => {
  getShortUrl(req, res);
});

app.post("/", async (req, res) => {
  if (req.body.fullUrl.includes("http") == true) {
    postUrl(req, res);
  } else {
    res.status(401).json({ message: "provide valid links !" });
  }
});

app.listen(8080, () => {
  console.log("server is running on port 8080");
});
