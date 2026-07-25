const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
// schema
const Article = require('../models/article')
const User = require('../models/user')

// Custom Guard Middleware to protect specific routes
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('danger', 'Please Login')
    res.redirect('/users/login');
}

// Add Article Form
router.get('/add', checkAuthenticated, (req, res) => {
    res.render('add_article', {
        heading: "Add Article",
        paragraph: "Provide details of article."
    })
})

// Save articles
router.post('/add', [body('title').notEmpty().withMessage('Title is required'),
body('body').notEmpty().withMessage('Body is required')], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('add_article', {
                heading: "Add Article",
                paragraph: "Provide details of article.",
                errors: errors.array()
            })
        } else {
            const { title, body } = req.body
            const author = req?.user
            const article = new Article({ title, author, body })
            const result = await article.save();
            // console.log('New Article Inserted');
            req.flash('success', 'New Article Added')
            res.redirect('/')
        }
    } catch (error) {
        console.error('Error inserting data:', error);
    }
})

// Update article form
router.get('/edit/:id', checkAuthenticated, async (req, res) => {
    try {
        const id = req.params.id
        const article = await Article.findById(id);
        if (article.author != req.user) {
            req.flash('danger', 'Not Authorized')
            res.redirect('/')
        } else {
            res.render('edit_article', {
                heading: "Edit Article",
                paragraph: "Provide new details of article. Click on Edit.",
                article: article
            })
        }
    } catch (err) {
        console.log('Error Fetching Article for Update:', err)
    }
})

// update article process
router.post('/edit/:id', async (req, res) => {
    try {
        const query = { _id: req.params.id }
        const { title, author, body } = req.body
        // const result = await Article.findByIdAndUpdate(query, { $set: { title, author, body } });
        const result = await Article.updateOne(query, { $set: { title, author, body } });
        // console.log('Article Updated');
        req.flash('success', 'Article Updated')
        res.redirect('/')
    } catch (err) {
        console.log('Error Updating Article:', err)
    }
})


//single article route
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const article = await Article.findById(id);
        const user = await User.findById(article?.author)
        res.render('article', {
            article: article,
            author: user.name
        })
    } catch (err) {
        console.log('Error Fetching Single Article:', err)
    }
})

// Delete Article route
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).send('Unauthorized')
        } else {
            const id = req.params.id
            const article = await Article.findById(id)
            if (article.author !== req?.user) {
                res.status(403).send('Forbidden')
            } else {
                const query = { _id: id }
                // const result = await Article.findByIdAndDelete(query);
                const result = await Article.deleteOne(query);
                // console.log('Article Deleted');
                res.status(200).send('Success')
            }
        }
    } catch (err) {
        console.log('Error Deleting Single Article:', err)
    }
})

module.exports = router