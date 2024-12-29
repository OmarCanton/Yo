require('dotenv').config()
const mongoose = require('mongoose')

const MONGODB_URL = process.env.MONGODB_URL

const connectToDB = async () => {
    try {
        await mongoose.connect(MONGODB_URL)
        .then(() => console.log('Database connection established'))
        .catch(err => console.log(err))
    } catch (err) {
        console.log(`There was an error connecting to the database\n${err}`)
    }
}
module.exports = connectToDB