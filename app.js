const express = require('express');
const cookieParser = require('cookie-parser'); // parse cookie header
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const passport = require('passport');
const authCheck = require('./middlewares/authCheck');

require('dotenv').config();
require('./config/database').connect();
require('./models/File');
require('./models/Folder');
require('./models/User');

const User = mongoose.model('users');

const app = express();
app.use(bodyParser.json());

app.use(express.json());

const port = 3000;

require('./config/passport-setup');
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');

app.use(cookieParser());

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate('session'));

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/folders', /* authCheck, */ folderRoutes);

app.get('/api/current-user', authCheck, async (req, res) => {
  req.session.cookie.expires = false;
  req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
  const user = await User.populate(req.user, 'childFolders files');
  res.status(200).send({
    authenticated: true,
    message: 'user successfully authenticated',
    user,
    cookies: req.cookies,
  });
});

// connect react to nodejs express server
app.listen(port, () => console.log(`Server is running on port ${port}!`));
