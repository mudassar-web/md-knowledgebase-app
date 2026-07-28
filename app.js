require('dotenv').config();
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator');
const flash = require('connect-flash')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
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

//Session middleware - to execute on localhost: uncomment lines 38 to 42 and comment lines 45 to 49, 52 to 54, 63, 66 to 77
// app.use(session({
//     secret: 'keyboard cat',
//     resave: true,
//     saveUninitialized: true
// }))

// creation of store for production server
const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    databaseName:'nodekb',
    collection: 'nodekbSessions'
});

// catch errors
store.on('error', function (error) {
    console.log('MongoDB Store Error:', error);
});

// 1. Enable CORS for your specific frontend domain with credentials allowed
// app.use(cors({
//   origin: 'https://vercel.app',
//   credentials: true
// }));

// 2. Trust the Vercel reverse proxy
app.set('trust proxy', 1);

// 3. Define the session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true, // Required for HTTPS on Vercel
        sameSite: 'none', // Required if frontend and backend are on different domains
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week - // maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

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

// health check
app.get('/health', (_req, res) => {
    const data = {
        uptime: process.uptime(),
        message: 'Ok',
        date: new Date()
    }
    res.status(200).send(data)
})

// Adding different routes
app.use('/articles', articleRoutes)
app.use('/users', userRoutes)

const PORT = process.env.PORT || 5000;

//start server
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}\nhttp://localhost:${PORT}`)
})