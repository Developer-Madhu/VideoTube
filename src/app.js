import express from 'express'
import cors from 'cors'
import healthCheckRoutes from './routes/healthCheckRoutes.js'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true, limit:'16kb'}))
app.use(cors({credentials:true, origin:process.env.CORS_ORIGIN}))
app.use(express.static('public'))
app.use(cookieParser())
app.use("/api/v1/healthcheck", healthCheckRoutes)

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

export {app}        