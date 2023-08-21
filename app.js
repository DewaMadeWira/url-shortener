const express = require('express');
const db = require('./database');



const app = express();
app.use(express.json());

var cors = require('cors');
app.use(cors());

app.set('view engine', 'ejs');

// Allow URL Encoded
app.use(express.urlencoded({ extended: true }));

// Static Files for Images
app.use(express.static('public'));

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
