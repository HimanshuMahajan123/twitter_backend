import { Router } from "express"

const router = Router();
import { verifyjwt } from "../middlewares/auth.middlewares.js";
import { getUserDashboard } from "../controllers/user.controllers.js";
import { getFollowers } from "../controllers/user.controllers.js";
import { getFollowing } from "../controllers/user.controllers.js";  
router.get("/dashboard/" , verifyjwt, getUserDashboard);
router.get("/followers/", verifyjwt, getFollowers);
router.get("/following/", verifyjwt, getFollowing);
router.put("/updateprofile/:key", verifyjwt, );
export default router;