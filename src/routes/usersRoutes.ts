import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest, UserPayload } from "../libs/types.js";

// import authentication middleware
import { authenticateToken } from "../middlewares/authenMiddleware.ts";

// import database
import { users } from "../db/db.ts";
import { authenticateToken } from "../middlewares/authenMiddleware.ts";

const router = Router();

// POST /api/vXXX/auth/login
router.post("/login", (req: Request, res: Response) => {
  try {
    
    //Get username and password from request body
    const { username, password } = req.body;
    console.log("Login request received:", { username, password });
    const user = users.find(
      (u: User) => u.username === username && u.password === password);
    
    //chexk if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Username or Password is incorrect",
      });
    }

    //create payload for JWT
    const JWT_secret = process.env.JWT_SECRET || "this is a secret key";
    const token = jwt.sign(
      { username: user.username, userId: user.userId, password: user.password } as UserPayload,
      JWT_secret,
      { expiresIn: "10m" }
    );
        
    user.tokens = user.tokens? [...user.tokens, token] : [token];

    //sent http with token in response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Username or Password is incorrect",
      error: err,
    });
  }
});

// POST /api/vXXX/auth/logout
router.post("/logout", authenticateToken, (req: Request, res: Response) => {
  try {
    const payload = (req as any).user;
    const token = (req as any).token;

    // find user by payload.username
    const user = users.find((u: User) => u.username === payload.username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // check if token exists in user.tokens
    if (!user.tokens || !user.tokens.includes(token)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // if token exists, remove the token from user.tokens
    user.tokens = user.tokens?.filter((t) => t !== token);
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/vXXX/auth/reset
// router.post("/reset", (req: Request, res: Response) => {
//   try {
//     reset_users();
//     return res.status(200).json({
//       success: true,
//       message: "User database has been reset",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Something is wrong, please try again",
//       error: err,
//     });
//   }
// });

export default router;