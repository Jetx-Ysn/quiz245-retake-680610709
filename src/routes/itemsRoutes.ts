import { Router, type Request, type Response } from "express";
// import Zod validators
import {
  zUserId,
  zItemId,
  zItemPostBody,
  zItemPutBody,
  zItemDeleteBody
} from "../libs/zodValidators.js";
// import types
import type { Item, CustomRequest } from "../libs/types.ts";
// import database
import { items } from "../db/db.ts";
//import uuid
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from "../middlewares/authenMiddleware.ts";
import {checkRoleMiddleware} from "../middlewares/checkRoleMiddleware.ts";

const router = Router();

// GET /api/vXXX/items/:userId 
router.get("/:userId", 
  authenticateToken, 
  checkRoleMiddleware, 
  (req: CustomRequest, res: Response) => {
    try {
      const userId = req.params.userId;
      const user = req.user;

      //check useid
      const result = zUserId.safeParse(userId);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid userId",
          error: result.error.issues[0]?.message;
        });
      }
      if(!user){
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
      if(user.userId !== userId){
        return res.status(403).json({
          success: false, 
          message; "Forbidden access",
        });
      }

      const userItems = items.filter((item: Item) => item.userId === userId);
      return res.status(200).json({
        success: true,
        data: userItems,
      });
    }
    catch (err) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: err,
      });
    }
  },
);

// POST /api/vXXX/items/:userId, body = {new item data}
// add a new Item for userId
router.post("/",async (req: Request, res: Response) => {
  
  res.status(201).json({
    success: true,
  });
  
});

// Delete /api/vXXX/items/:userId


export default router;