const passport = require('passport')
const { Strategy } = require('passport-local')
const bcrypt = require('bcrypt')
const Users = require('../../Configuration/Models/UsersSchema')


passport.serializeUser((user, done) => {
    return done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
    try {
        const findUser = await Users.findById(id)
        if(!findUser) return done(null, false, {message: 'User not found'})
        done(null, findUser)
    } catch (err) {
        done(err, null)
    }
})

passport.use('local-signin',
    new Strategy({usernameField: 'email', passwordField: 'password'}, async (email, password, done) =>  {
        try {
            const findUser = await Users.findOne({email})
            if(!findUser) return done(null, false, {message: 'User not found, please sign up!'})
            
            const samePassword = await bcrypt.compare(password, findUser.password)
            if(!samePassword) return done(null, false, {message: 'Incorrect Password entered'})
            
            done(null, findUser, {message: `Welcome ${findUser.username ? findUser.username  : `User ${findUser.phone}`}`})
        } catch(err) {
            done(err, null)
        }
    })
)
module.exports = passport