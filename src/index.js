import dotenv from 'dotenv'
import { app } from "../src/app.js";
import ConnectDB from './db/index.js';

// Configure dotenv to use root .env file

dotenv.config()
const PORT = process.env.PORT || 8000

ConnectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`App is listening on ${PORT}`)
        })
    })
    .catch((err) => {
        console.log("MongoDB Conn error !")
    })
