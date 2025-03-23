import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import { upload } from '../middlewares/multerHandler.js'

const router = Router()

router.route("/register").post(
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverimg', maxCount: 1 }]),
    registerUser)

export default router