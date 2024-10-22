import e from "express";
import express from "express";

const router = express.Router();


router.get("/conversations", (req, res) => {
  res.send("Conversations collected!");
});


export default router;