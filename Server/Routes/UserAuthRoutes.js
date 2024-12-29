const { Router } = require('express')
const passport = require('passport')
const router = Router()
require('../Authentication/LocalStrategy/SignupStrategy')
require('../Authentication/LocalStrategy/SignInStrategy')
const nodemailer = require('nodemailer')
const Users = require('../Configuration/Models/UsersSchema')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const multer = require('multer')
const upload = require('../Configuration/multerConfig')


router.post('/auth/signup-send-code', (req, res ,next) => {
    passport.authenticate('local-signup', async (err, user, info) => {
        try {
            if(err) return res.json({success: false, error: "An unexpected error occured"})
            
            if(!user) return res.json({success: false, error: info.message})
            
            //generate 6-digit Token using crypto and twilio
            const randomCode = Math.floor(100000 + Math.random() * 900000).toString()

            //hashing the random code
            const saltRounds = 10
            const salt = await bcrypt.genSalt(saltRounds)
            const code = await bcrypt.hash(randomCode, salt)

            user.verificationCode = code
            user.verificationCodeExpire = Date.now() + 5 * 60 * 1000 //Store token for 5 minutes

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'yowebapp@gmail.com',
                    pass: process.env.PASS
                }
            })

            const message = `
            <h2>This is your Yo Account code, please DO NOT share this code with anyone. Code expires in the next 5 minutes</h2>
            <h1>${randomCode}<h1>`

            const mailSent = await transporter.sendMail({
                to: user.email,
                subject: 'Verify your Yo Account',
                html: message
            })
            if(mailSent) {
                await user.save() //save token and expiry to the database
                res.json({success: true, user,  message: 'Verification code sent'})
            } else {
                res.json({success: false, error: 'An error occured sending verification code, please try again later'})
            }

        } catch (err) {
            res.json({ success: false, error: err.message})
        }
    })(req, res, next)
})

router.post('/auth/signup-verify-code', async (req, res) => {
    const {otpCode, id} = req.body
    try {

        const findUser = await Users.findById(id)

        if(!findUser) return res.json({success: false, error: 'User not found, please sign up'})
        
        const isCodeEqual = await bcrypt.compare(otpCode, findUser.verificationCode)
        const codeNotExpired = findUser.verificationCodeExpire > Date.now()
        if(isCodeEqual && codeNotExpired) {
            findUser.verificationCode = undefined
            findUser.verificationCodeExpire = undefined
            await findUser.save()
            res.json({success: true})
        } else {
            return res.json({success: false, error: 'Invalid or expired code'})
        }
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: 'Invalid Code'})
    }
})

router.post('/resend-code', async (req, res) => {
    const {id} = req.body

    try {
        const findUserWithId = await Users.findById(id)
        if(!findUserWithId) return res.json({success: false, error: 'User not found'})

        //generate code for user
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
        //hashing the random code
        const saltRounds = 10
        const salt = await bcrypt.genSalt(saltRounds)
        const code = await bcrypt.hash(randomCode, salt)

        findUserWithId.verificationCode = code
        findUserWithId.verificationCodeExpire = Date.now() + 5 * 60 * 1000 //Store token for 5 minutes

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'yowebapp@gmail.com',
                pass: process.env.PASS
            }
        })

        const message = `
        <h2>This is your Yo Account code, please DO NOT share this code with anyone. Code expires in the next 5 minutes</h2>
        <h1>${randomCode}<h1>`

        const mailSent = await transporter.sendMail({
            to: findUserWithId.email,
            subject: 'Verify your Yo Account',
            html: message
        })
        if(mailSent) {
            await findUserWithId.save() //save token and expiry to the database
            res.json({success: true, user: findUserWithId, message: 'Verification code sent'})
            console.log(findUserWithId)
        } else {
            res.json({success: false, error: 'An error occured sending verification code, please try again later'})
        }

    } catch(err) {
        res.json({success: false, message: err})
    }
})


router.post('/auth/signin', (req, res, next) => {
    const {rememberMe} = req.body
    passport.authenticate('local-signin', (err, user, info) => {
        try {
            if(err) return res.json({success: false, error: "An unexpected error occured"})
            if(!user) return res.json({success: false, error: info.message})

            if(user.isAuthenticated === false) return res.json({isAuth: false,  message: 'Please verify your account to login'})
            
            req.login(user, (err) => {
                if(err) return res.json({success: false, message: err})
                if(rememberMe) req.session.cookie.originalMaxAge = 1000 * 60 * 60 * 24 * 365 * 2 //user session kept for 2 years 

                res.json({success: true, message: info.message, user})
            })
        } catch (err) {
            res.json({success: false, error: err})
        }
    })(req, res, next)
})

router.post('/addCreds-profile-photo-startup/:id', upload.single('photo'), async (req, res) => {
    const { id } = req.params
    try {
        const profilePhoto = req.file.path
        const findUserAndUpdatePhoto = await Users.findByIdAndUpdate(
            id,
            {profileImage: profilePhoto},
            {new: true}
        )
        if(findUserAndUpdatePhoto) return res.json({success: true, profilePicture: findUserAndUpdatePhoto})
    } catch (err) {
        res.json({success: false, error: err})
    }
    
})
router.post('/addCreds-username-startup/:id', async (req, res) => {
    const { id } = req.params
    const { username } = req.body
    try {
        if(username === '') return res.json({success: false, error: 'Username required'})
        const existingUsername = await Users.findOne({username})
        if(existingUsername) return res.json({success: false, error: 'Username taken, choose a different one'})
        const findUserAndUpdateUsername = await Users.findByIdAndUpdate(
            id,
            {username},
            {new: true}
        )
        if(findUserAndUpdateUsername) {
            findUserAndUpdateUsername.isAuthenticated = true
            findUserAndUpdateUsername.save()
            return res.json({success: true, message: 'Success! You are all verified, please login'})
        }
    } catch (err) {
        res.json({success: false, error: err})
    }
})
router.use((err, req, res, next) => {
    if(err instanceof multer.MulterError) {
        if(err.code === 'LIMIT_FILE_SIZE') return res.json({success: false, error: 'Image size too large. Size must be less than 2MB'})
        if(err.code === 'LIMIT_UNEXPECTED_FILE') return res.json({success: false, error: 'Only Image files accepted'})
        return res.json({success: false, error: err.message})
    } else if(err) {
        return res.json({success: false, error: 'An unknown error occured'})
    }
})

router.get('/checkAuth', (req, res) => {
    if(req.isAuthenticated()) {
        res.json({authenticated: true, user: req.user})
    } else {
        res.json({authenticated: false, message: 'Not authenticated, please log into your account'})
    }
})
router.get('/logout', (req, res) => {
    if(req.user) {
        req.logout(err => {
            if(err) {
                return res.json({success: false, error: 'error loggin out'})
            }
            res.clearCookie('connect.sid');
            return res.json({success: true, message: 'Successfully logged out'})
        })
    } else {
        return res.json({success: false, error: 'User not authenticated'})
    }
})

router.post('/forgot-password', async (req, res) => {
    const { resetEmail } = req.body
    if(resetEmail === '' || resetEmail === null) return res.json({success: false, error: 'Enter email'})
    const findUser = await Users.findOne({email: resetEmail})
    if(!findUser) return res.json({success: false, error: 'User not found'})
    
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    findUser.resetPasswordToken = hashedToken
    findUser.resetPasswordTokenExpires = Date.now() + 3600000
    await findUser.save()

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'yowebapp@gmail.com',
            pass: process.env.PASS
        }
    })

    const resetUrl = `${process.env.FRONT_END_URL}/reset-password/${resetToken}`
    const  message = `<h2>You requested for a password reset, click on the link below to reset password, expires in 1 hour</h2><a href=${resetUrl}>Click Here to reset password</a>`

    try {
        await transporter.sendMail({
            to: findUser.email,
            subject: 'Password Reset',
            html: message
        })
        res.json({success: true, message: 'Reset link sent to your email'}) 
    } catch (err) {
        findUser.resetPasswordToken = undefined
        findUser.resetPasswordTokenExpires = undefined
        await findUser.save()
        res.json({success: false, error: 'Reset link could not be sent, try again'})
    }
})

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params
    const { newPassword, confNewPassword } = req.body
    
    try {
        if(!newPassword) return res.json({success: false, error: 'Password required'})
        if(!confNewPassword) return res.json({success: false, error: 'Confirm new password'})

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const findUser = await Users.findOne({
            resetPasswordToken: hashedToken, 
            resetPasswordTokenExpires: { $gt: Date.now() }
        })

        if(!findUser) return res.json({success: false, error: 'Invalid or expired token'})

        if(newPassword !== confNewPassword) {
            return res.json({success: false, error: 'Passwords do not match'})
        }

        const compareWithExistingForgottenPassword = await bcrypt.compare(newPassword, findUser.password) 
        if(compareWithExistingForgottenPassword) return res.json({success: false, error: 'You recently used this password, choose a different one'})

        const saltRounds = 10
        const salt = await bcrypt.genSalt(saltRounds)
        const newUserPassword = await bcrypt.hash(newPassword, salt)
        findUser.password = newUserPassword
        findUser.resetPasswordToken = undefined
        findUser.resetPasswordTokenExpires = undefined

        await findUser.save()
        
        res.json({success: true, message: 'Password reset successful, please login'})
    } catch(err) {
        console.log(err)
        res.json({suuccess: false, error: err})
    }
})

router.get('/getProfilePhoto/:id', async (req, res) => {
    const { id } = req.params
    try {
        const findUser = await Users.findById(id)
        if(findUser) {
            return res.json({success: true, profile: findUser.profileImage})
        }
    } catch(err) {
        return res.json({success: false, error: err})
    }
})


module.exports = router