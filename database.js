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
