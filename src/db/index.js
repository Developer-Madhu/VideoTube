import mongoose from "mongoose";
import dotenv from 'dotenv'
import { DBNAME } from "../constants.js";
dotenv.config({
    path: '../.env'
})
const ConnectDB = async () => {
    try{
        // const dbconnect = await mongoose.connect(`mongodb+srv://vidtubeuser:vidtubeuser12@cluster0.gsfsr.mongodb.net/${DBNAME}`)
        const dbconnect = await mongoose.connect(`${process.env.MONGOURL}/${DBNAME}`)
        console.log('\nMongoDB Connected !')
        console.log(`DB Details : ${dbconnect.connection.host}`)
    }catch(er){
        console.log("MongDB Connection Failed!")
        console.error(er)
        process.exit(1)
    }
}

export default ConnectDB