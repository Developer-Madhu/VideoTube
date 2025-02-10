import express from 'express'
import cors from 'cors'

const app = express()

app.use(express.json({limit:'1024kb'}))
app.use(express.urlencoded({extended:true, limit:'1024kb'}))
app.use(cors({credentials:true, origin:process.env.CORS_ORIGIN}))
app.use(express.static('public'))

export {app}