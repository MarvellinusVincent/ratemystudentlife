const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
require("dotenv").config();

const app = express();
app.set('etag', false);
app.use(express.json());
app.use('/sitemap', express.static(path.join(__dirname, '../frontend/public'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.xml')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.removeHeader('ETag');
      }
    },
    maxAge: '1d'
  }));
  
  app.use((req, res, next) => {
    if (req.path.match(/sitemap.*\.xml$/)) {
      res.set({
        'Cache-Control': 'public, max-age=86400',
        'X-Robots-Tag': 'noindex'
      });
      res.removeHeader('ETag');
    }
    next();
  });
const corsOptions = {
    origin: [
      "https://ratemyuniversity.vercel.app",
      "https://ratemyuniversity.io",
      "http://localhost:3000",
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
};
  
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '../frontend/public'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.xml')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
    maxAge: '1d'
  }));

const userRoutes = require('./routes/user_routes');
const reviewRoutes = require('./routes/review_route');
const specificUniversityRoutes = require('./routes/university');
const searchUniversityRoutes = require('./routes/search_university');
const emailRoutes = require('./routes/email_route');
const sitemapRoutes = require('./routes/sitemap_route');

app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/reviews', reviewRoutes);
app.use('/specificUni', specificUniversityRoutes);
app.use('/searchUniversity', searchUniversityRoutes);
app.use('/email', emailRoutes);
app.use('/', sitemapRoutes);

const { pool } = require('./config/db');
pool.connect()
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Error connecting to the database", err));

const PORT = process.env.PORT || 1234;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
