const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const passport = require('passport')
// User modal
const User = require('../models/user')

router.get('/register', (req, res) => {
    res.render('register', {
        heading: "Register",
        paragraph: "Provide users details for Registration."
    })
})

// save user details
router.post('/register', [body('name').notEmpty().withMessage('Name is required'), body('email').notEmpty().withMessage('Email is required'),
body('email').isEmail().withMessage('Email should be in proper format'), body('username').notEmpty().withMessage('Username is required'),
body('password').notEmpty().withMessage('Password is required'), body('password2').notEmpty().withMessage("Password2 is required")], async (request, respose) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            respose.render('register', {
                heading: "Register",
                paragraph: "Provide users details for Registration.",
                errors: errors.array()
            })
        } else {
            const { name, email, username, password } = request.body
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({ name: name, email: email, username: username, password: hashedPassword })
            const result = await user.save();
            // console.log('New User Inserted');
            request.flash('success', 'Registered Successfully')
            respose.redirect('/users/login')
        }
    } catch (error) {
        console.error('Error inserting data:', error);
    }
})

//login form
router.get('/login', async (req, res) => {
    res.render('login', {
        heading: "Login",
        paragraph: "Provide users details for login to Knowledgebase App.",
    })
})

// login password check
router.post('/login', async (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        successMessage: 'Welcome to Knowledgebase app',
        successFlash: true,
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next)
})

//logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) throw new Error('Error in logging out:', err)
        req.flash('success', 'You are logged out')
        res.redirect('/users/login')
    })
})

module.exports = router