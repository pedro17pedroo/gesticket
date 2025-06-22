import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { isAuthenticated } from "../replitAuth";

const router = Router();
const userController = new UserController();

router.get('/auth/user', isAuthenticated, (req, res) => 
  userController.getCurrentUser(req, res)
);

export { router as default };