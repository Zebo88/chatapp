import express from "express";
import { login, logout, signup, getMe } from "../controllers/auth.controller";
import protectRoute from "../middleware/protectRoute";

const router = express.Router();
// <url> currently is http://localhost:3000

// <url>/api/auth/me
router.get("/me", protectRoute, getMe);

// <url>/api/auth/signup
router.post("/signup", signup);

// <url>/api/auth/login
router.post("/login", login);

// <url>/api/auth/logout
router.post("/logout", logout);



export default router;