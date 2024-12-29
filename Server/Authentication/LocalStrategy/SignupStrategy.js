const passport = require("passport")
const { Strategy } = require('passport-local')
const Users = require('../../Configuration/Models/UsersSchema')
const bcrypt = require('bcrypt')

passport.serializeUser((user, done) => {
    return done(null, user.id)
})

passport.deserializeUser( async (userId, done) => {
    try {
        const findUserWithId = await Users.findById(userId)
        if(!findUserWithId) return done(null, false, {message: 'User Not Found'})
        done(null, findUserWithId)
    } catch (err) {
        done(err, null)
    }
})

passport.use('local-signup', 
    new Strategy({passReqToCallback: true, usernameField: 'email', passwordField: 'password'}, async (req, email, password, done) => {
        const { confPassword, birthdate, sex } = req.body
        try {
            if(!email) return done(null, false, {message: 'Email is required!'})
            if(!password) return done(null, false, {message: 'Password required!'})
            if(!confPassword) return done(null, false, {message: 'Confirm password!'})
            
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z0-9!@#$%^&*()_+-|{}]{8,}$/
            if(!passwordRegex.test(password)) {
                return done(null, false, {message: 'Password must contain at least one uppercase, one number, one special character and must be at least 8 characters long ' })
            }

            //taking care of already existing credentials at signup
            const existingAcc = await Users.findOne({email})
            if(existingAcc) return done(null, false, {message: 'Account already exist, please sign in'})

            const saltRounds = 10
            const salt = await bcrypt.genSalt(saltRounds)
            const hashedPassword = await bcrypt.hash(password, salt)
            const hashedConfPassword = await bcrypt.hash(confPassword, salt)
            if(hashedConfPassword !== hashedPassword) return done(null, false, {message: 'Passwords do not match!'})

            //create the user in the database
            const newUser = new Users({
                email,
                password: hashedPassword,
                birthdate,
                sex
            })
            await newUser.save()

            done(null, newUser, {message: 'Signup successful'})
        } catch (err) {
            console.log(err)
            done(err, null)
        }
    })
)

module.exports = passport