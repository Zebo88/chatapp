import express from "express";
import { sendMessage, getMessages, getUsersForSidebar } from "../controllers/message.controller";
import protectRoute from "../middleware/protectRoute";

const router = express.Router();

router.get("/conversations", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages); // The id of a specific conversation with a user. The order of this route needs to come after the /conversations to avoid conflicts. 
router.post("/send/:id", protectRoute, sendMessage);


export default router;