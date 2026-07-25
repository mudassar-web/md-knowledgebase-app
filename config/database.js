const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
  try {
    // Establish connection
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Database connection error: ${error.message}`)
    process.exit(1) // Stop the application on failure
  }
};

module.exports = connectDB