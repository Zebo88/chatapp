// Middleware for validating json web tokens

import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma';

interface DecodedToken extends JwtPayload {
  userId: string;
}// Define the structure of the decoded token

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
      }
    }
  }
}// Extend the Request interface to include a user object that can be accessed in the request object 

const protectRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.jwt; // Get the token from the cookie
    if (!token) {
      res.status(401).json({ error: "Unauthorized - No token provided!" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken; // Verify the token with the JWT secret and get the decoded payload

    if (!decoded) {
      res.status(401).json({ error: "Unauthorized - Invalid token!" });
      return;
    }

    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId } , 
      select: { id: true, username: true, fullname: true, profilePic: true}
    }); // Find the user by the decoded user id with select fields

    if (!user) {
      res.status(401).json({ error: "User not found!" });
      return;
    }

    req.user = user; // Set the user in the request object

    next(); // Call the next middleware

  } catch (error: any) {
    console.log("Error in protectRoute middleware.", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default protectRoute;