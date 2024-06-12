const express = require('express');
const db = require('./database').default;

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

var options = {
    swaggerDefinition: {
        info: { title: 'URL Shortener App', version: '1.1.0' },
    },
    apis: ['app.js'],
    swaggerOptions: {
        validatorUrl: null,
    },
};

const swaggerDocs = swaggerJsDoc(options);

const app = express();
app.use(express.json());

var cors = require('cors');
app.use(cors());

app.set('view engine', 'ejs');

// Allow URL Encoded
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Static Files for Images
app.use(express.static('public'));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns all URLs
 *     tags: [URLs]
 *     responses:
 *       200:
 *         description: the list of all URLs
 */
app.get('/', async (req, res) => {
    db.getUrl(req, res);
});

app.get('/:shortUrl', async (req, res) => {
    db.getShortUrl(req, res);
});

app.post('/', async (req, res) => {
    if (req.body.fullUrl.includes('http') == true) {
        db.postUrl(req, res);
    } else {
        res.status(401).json({ message: 'provide valid links !' });
    }
});

app.listen(8080, () => {
    console.log('server is running on port 8080');
});
