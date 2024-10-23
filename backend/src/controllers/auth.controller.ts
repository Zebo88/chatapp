import { Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma';
import bcryptjs from 'bcryptjs';
import generateToken from '../utils/generateToken';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, fullname, username, password, confirmPassword, gender } = req.body;

    if (!email || !fullname || !username || !password || !confirmPassword || !gender) {
      res.status(400).json({ error: "Please fill in all fields" });
      return;
    } // Check if all fields are filled

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    } // Check if passwords match

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    }); // Check if user already exists

    if (user) {
      res.status(400).json({ error: "Username already exists" }); 
      return;
    }

    const salt = await bcryptjs.genSalt(10); // create 10 rounds of salt
    const hashedPassword = await bcryptjs.hash(password, salt); // hash the password with the salt

    const boyProfilePic = 'https://avatar.iran.liara.run/public/boy?username=${username}';
    const girlProfilePic = 'https://avatar.iran.liara.run/public/girl?username=${username}';

    const newUser = await prisma.user.create({
      data: {
        email,
        fullname,
        username,
        password: hashedPassword,
        gender,
        profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
      }
    });

    if (newUser) {
      generateToken(newUser.id, res); // Generate token and set cookie

      res.status(201).json({ // Respond with user data
        id: newUser.id,
        fullname: newUser.fullname,
        username: newUser.username,
        profilePic: newUser.profilePic,
        message: "User created successfully" 
      });
    } else {
      res.status(400).json({ error: "Invalid user data!"});
    }

  } catch (error: any) {
    console.log("Error in signup controller.", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    generateToken(user.id, res); // Generate token and set cookie

    res.status(200).json({
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      profilePic: user.profilePic,
      message: "Logged in successfully"
    });

  } catch (error: any) {
    console.log("Error in login controller.", error.message);
    res.status(500).json({ error: "Internal server error" });    
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.cookie('jwt', '', { maxAge: 0 }); // Clear the cookie
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.log("Error in logout controller.", error.message);
    res.status(500).json({ error: "Internal server error" });    
  }
};

// Get the currently logged in user, if not logged in, return an error
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if(!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      profilePic: user.profilePic,
    });

  } catch (error: any) {
    console.log("Error in getMe controller.", error.message);
    res.status(500).json({ error: "Internal server error" });    
    
  }
}

/*
  Create a user avatar using https://avatar-placeholder.iran.liara.run/
    Random avatar: https://avatar.iran.liara.run/public
    Random Male avatar: https://avatar.iran.liara.run/public/boy
    Random Female avatar: https://avatar.iran.liara.run/public/girl
    Specific Male avatar: https://avatar.iran.liara.run/public/boy?username=[value]
      -where [value] is the username of the user
    Specific Female avatar: https://avatar.iran.liara.run/public/girl?username=[value]
*/