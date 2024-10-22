import jwt from 'jsonwebtoken';
import { Response } from 'express';

const generateToken = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { // Sign the token with the user id and JWT secret (meaning the token is valid and hasn't been tampered with).
    expiresIn: '15d', // Token expires in 15 days
  });

  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client side JS from reading the cookie (Prevention of XSS or cross-site scripting)
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    sameSite: "strict", // Cookie is only sent in same-site requests (not in cross-site requests, preventing CSRF attacks (Cross-Site Request Forgery))
    secure: process.env.NODE_ENV === "development" ? true : false, // HTTPS only in development
  })

  return token;
}

export default generateToken;
