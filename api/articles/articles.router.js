const express = require("express");
const Article = require("./articles.schema");
const auth = require("../../middlewares/auth");
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Accès réservé aux administrateurs" });
}

router.post("/", auth, async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const article = new Article({
      title,
      content,
      status,
      user: req.user.id,
    });
    await article.save();
    req.io.emit("article_created", article);
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });
    req.io.emit("article_updated", article);
    res.json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });
    req.io.emit("article_deleted", { id: req.params.id });
    res.json({ message: "Article supprimé" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;


const User = require("../users/users.model");
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    const articles = await Article.find({ user: req.params.userId });
    res.json({ user, articles });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
