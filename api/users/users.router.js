const express = require("express");
const usersController = require("./users.controller");
const router = express.Router();
const Article = require("../articles/articles.schema");

router.get("/:userId/articles", async (req, res) => {
  try {
    const user = await require("./users.model")
      .findById(req.params.userId)
      .select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    const articles = await Article.find({ user: req.params.userId });
    res.json({ user, articles });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", usersController.getAll);
router.get("/:id", usersController.getById);
router.post("/", usersController.create);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.delete);

module.exports = router;
