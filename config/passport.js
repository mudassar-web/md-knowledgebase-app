const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user')
const config = require('./database')

function initializePassport(passport) {
    // Define the verification logic
    const authenticateUser = async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });

            // 1. Check if the user exists
            if (user == null) {
                return done(null, false, { message: 'No user found with given username' });
            }

            // 2. Validate the password using bcrypt
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user); // Success
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            return done(error); // Server/database error
        }
    };

    // Configure LocalStrategy
    passport.use(new LocalStrategy({ username: 'username' }, authenticateUser));

    // Serialize user ID into the session cookie
    passport.serializeUser((user, done) => done(null, user.id));

    // Deserialize user object back from the ID stored in the session cookie
    passport.deserializeUser(async (id, done) => {
        const user = await User.findOne({ _id: id });
        return done(null, user.id);
    });
}

module.exports = initializePassport;