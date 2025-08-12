const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const mongoose = require("mongoose");

// Mock direct du middleware d'authentification
jest.mock("../middlewares/auth");

describe("Articles endpoints (mocked)", () => {
  let tokenUser, tokenAdmin, userId, adminId, articleId;
  let app, auth;

  const mockArticle = {
    _id: "art1",
    title: "Titre",
    content: "Contenu",
    user: "u123",
    status: "draft",
    save: jest.fn().mockResolvedValue({
      _id: "art1",
      title: "Titre",
      content: "Contenu",
      user: "u123",
      status: "draft",
    }),
  };

  jest.mock("../api/articles/articles.schema", () => {
    class MockArticleModel {
      constructor(data) {
        return {
          ...mockArticle,
          ...data,
          save: jest.fn().mockResolvedValue({
            _id: "art1",
            ...data,
            user: "u123",
            status: data.status || "draft",
          }),
        };
      }
    }

    MockArticleModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      _id: "art1",
      title: "Nouveau titre",
      content: "Contenu",
      user: "u123",
    });

    MockArticleModel.findByIdAndDelete = jest.fn().mockResolvedValue({
      _id: "art1",
      title: "Titre supprimé",
    });

    return MockArticleModel;
  });

  beforeAll(() => {
    userId = "u123";
    adminId = "a456";
    articleId = "art1";
    tokenUser = jwt.sign({ id: userId, role: "member" }, config.secretJwtToken);
    tokenAdmin = jwt.sign(
      { id: adminId, role: "admin" },
      config.secretJwtToken
    );
  });

  beforeEach(() => {
    jest.resetModules();
    auth = require("../middlewares/auth");

    auth.mockImplementation((req, res, next) => {
      const token = req.headers["x-access-token"];
      if (!token) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      if (token === tokenAdmin) {
        req.user = { id: adminId, role: "admin" };
      } else if (token === tokenUser) {
        req.user = { id: userId, role: "member" };
      } else {
        return res.status(401).json({ message: "Token invalide" });
      }

      req.io = {
        emit: jest.fn(),
      };

      next();
    });

    app = require("../server").app;
  });

  it("crée un article (user mocké)", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set("x-access-token", tokenUser)
      .send({ title: "Titre", content: "Contenu" });

    console.log("CREATE response:", res.statusCode, res.body);
    expect(res.statusCode).toBe(201);
  });

  it("refuse la création sans token", async () => {
    const res = await request(app)
      .post("/api/articles")
      .send({ title: "Titre", content: "Contenu" });

    expect(res.statusCode).toBe(401);
  });

  it("met à jour un article (admin)", async () => {
    const res = await request(app)
      .put(`/api/articles/${articleId}`)
      .set("x-access-token", tokenAdmin)
      .send({ title: "Nouveau titre" });

    console.log("UPDATE response:", res.statusCode, res.body);
    expect(res.statusCode).toBe(200);
  });

  it("refuse la mise à jour si non admin", async () => {
    const res = await request(app)
      .put(`/api/articles/${articleId}`)
      .set("x-access-token", tokenUser)
      .send({ title: "Titre interdit" });

    expect(res.statusCode).toBe(403);
  });

  it("supprime un article (admin)", async () => {
    const res = await request(app)
      .delete(`/api/articles/${articleId}`)
      .set("x-access-token", tokenAdmin);

    console.log("DELETE response:", res.statusCode, res.body);
    expect(res.statusCode).toBe(200);
  });

  it("refuse la suppression si non admin", async () => {
    const res = await request(app)
      .delete(`/api/articles/${articleId}`)
      .set("x-access-token", tokenUser);

    expect(res.statusCode).toBe(403);
  });
});
