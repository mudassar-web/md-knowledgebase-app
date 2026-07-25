require('dotenv').config();
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator');
const flash = require('connect-flash')
const session = require('express-session')
const connectDB = require('./config/database')
const passport = require('passport');
const initializePassport = require('./config/passport');
// schema
const Article = require('./models/article')
const User = require('./models/user')
// routes
const articleRoutes = require('./routes/articles')
const userRoutes = require('./routes/users')

// Initialize DB
connectDB()

// Initialize App
const app = express()

//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//setting static resources
app.use(express.static(path.join(__dirname, 'public')))

//view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

//session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Initialize Passport Strategy settings
initializePassport(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//user object
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})

//home route
app.get('/', async (req, res) => {
    try {
        const articles = await Article.find({});
        if (Array.isArray(articles)) articles.sort((obj1, obj2) => obj1.title.localeCompare(obj2.title));
        res.render('index', {
            heading: "Articles",
            paragraph: "Knowlegdebase App with lots of articles!!!",
            articles: articles
        })
    } catch (err) {
        console.log('Article Fetch error', err)
    }
})

// Adding different routes
app.use('/articles', articleRoutes)
app.use('/users', userRoutes)

const PORT = process.env.PORT || 5000;

//start server
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}\nhttp://localhost:${PORT}`)
})