import { Router } from "express"

const router = Router();
import { verifyjwt } from "../middlewares/auth.middlewares.js";
import { getUserDashboard, toggleLike } from "../controllers/user.controllers.js";
import { getFollowers } from "../controllers/user.controllers.js";
import { getFollowing } from "../controllers/user.controllers.js";  
import { updateprofile } from "../controllers/user.controllers.js"; 
import { toggleFollow } from "../controllers/user.controllers.js";
router.get("/dashboard/" , verifyjwt, getUserDashboard);
router.put("/toggleLike/:postId" , verifyjwt, toggleLike);
router.put("/toggleFollow/:userId" , verifyjwt, toggleFollow);
router.get("/followers/", verifyjwt, getFollowers);
router.get("/following/", verifyjwt, getFollowing);
router.put("/updateprofile/:key", verifyjwt, updateprofile);
export default router;