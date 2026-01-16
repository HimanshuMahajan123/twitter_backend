import { Router } from "express";
import {
  addFollow,
  removeFollow,
  getFollowers,
  getFollowing,
} from "../controllers/follow.controller.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";
import { validateObjectId } from "../validators/index.js";

const router = Router();

router.post("/addFollow/:userId", verifyjwt, validateObjectId, addFollow);
router.delete(
  "/deleteFollow/:userId",
  verifyjwt,
  validateObjectId,
  removeFollow,
);
router.get("/getFollowers/:userId", verifyjwt, validateObjectId, getFollowers);
router.get("/getFollowing/:userId", verifyjwt, validateObjectId, getFollowing);

export default router;
