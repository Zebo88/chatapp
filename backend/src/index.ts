import express from 'express';
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route';
import messageRoutes from './routes/message.route';

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env

const app = express();

app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(express.json()); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(3000, () => {
  console.log('\nServer is running on port 3000');
});

