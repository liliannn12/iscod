const Article = require("./articles.schema");
const User = require("../users/users.model");

class ArticlesService {
  async create(articleData, userId) {
    const { title, content, status } = articleData;
    const article = new Article({
      title,
      content,
      status,
      user: userId,
    });
    return await article.save();
  }

  async update(id, updateData) {
    const article = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return article;
  }

  async delete(id) {
    return await Article.findByIdAndDelete(id);
  }

  async getUserArticles(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const articles = await Article.find({ user: userId });
    return { user, articles };
  }
}

module.exports = new ArticlesService();
