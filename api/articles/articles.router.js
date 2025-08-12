const express = require("express");
const auth = require("../../middlewares/auth");
const articlesController = require("./articles.controller");
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Accès réservé aux administrateurs" });
}

router.post("/", auth, articlesController.create);
router.put("/:id", auth, requireAdmin, articlesController.update);
router.delete("/:id", auth, requireAdmin, articlesController.delete);
router.get("/user/:userId", articlesController.getUserArticles);

module.exports = router;
