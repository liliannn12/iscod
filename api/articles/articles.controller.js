const articlesService = require("./articles.service");

class ArticlesController {
  async create(req, res) {
    try {
      const article = await articlesService.create(req.body, req.user.id);
      req.io.emit("article_created", article);
      res.status(201).json(article);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const article = await articlesService.update(req.params.id, req.body);
      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      req.io.emit("article_updated", article);
      res.json(article);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const article = await articlesService.delete(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      req.io.emit("article_deleted", { id: req.params.id });
      res.json({ message: "Article supprimé" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async getUserArticles(req, res) {
    try {
      const result = await articlesService.getUserArticles(req.params.userId);
      res.json(result);
    } catch (err) {
      if (err.message === "Utilisateur non trouvé") {
        return res.status(404).json({ message: err.message });
      }
      res.status(400).json({ message: err.message });
    }
  }
}

module.exports = new ArticlesController();
