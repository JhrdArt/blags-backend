require("dotenv").config();
const bcrypt = require("bcrypt");
const supertest = require("supertest");
const mongoose = require("mongoose");

const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialblogs);
  //   const blogObjects = helper.initialblogs.map((blog) => new Blog(blog));
  //   const promiseArray = blogObjects.map((blog) => blog.save());
  //   await Promise.all(promiseArray);
});
describe("when there is initial blog saved", () => {
  test("Blogs are returned as json format", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("content-type", /application\/json/);
  });

  test("check blogs identifier to be default 'id'", async () => {
    const response = await Blog.find({});
    const ids = response.map((blog) => blog.id);

    for (let id of ids) {
      expect(id).toBeDefined();
    }
  });
  // test("All blogs are returned", async () => {
  //   const response = await api.get("/api/blogs");
  //   expect(response.body).toHaveLength(helper.initialblogs.length);
  // });

  // test("A specific blog is whitin the returned blogs", async () => {
  //   const response = await api.get("/api/blogs");
  //   const blogTitle = response.body.map((r) => r.title);

  //   expect(blogTitle).toContain("Hola Mundo");
  // });
});

let token = null;

beforeAll(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("12345", 10);
  const user = await new User({
    username: "name",
    passwordHash,
  }).save();

  const userFromToken = { username: "name", id: user.id };
  return (token = jwt.sign(userFromToken, process.env.SECRET));
});
describe("addition a new Blog", () => {
  test("A valid blog can be added by authorize user", async () => {
    const newBlog = {
      author: "New Author",
      url: "example.com",
      likes: 245,
      title: "Example blog",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect("content-type", /application\/json/);

    const blogAtEnd = await helper.blogsInDb();
    expect(blogAtEnd).toHaveLength(helper.initialblogs.length + 1);
  });

  test("If 'likes' are not defined, their value will be 0", async () => {
    const newBlog = {
      title: "You like me",
      author: "Likend",
      url: "likes.com.ar",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect("content-type", /application\/json/);

    const blogAtEnd = await helper.blogsInDb();
    expect(blogAtEnd).toHaveLength(helper.initialblogs.length + 1);
    expect(blogAtEnd[blogAtEnd.length - 1].likes).toBe(0);
  });

  test("If url and title are missing, status 400", async () => {
    const newBlog = {
      author: "Yo merito",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const blogAtEnd = await helper.blogsInDb();
    expect(blogAtEnd).toHaveLength(helper.initialblogs.length);
  });

  test("succeed whit status 204 if id is valid", async () => {
    const blogAtStart = await Blog.find({}).populate("user");
    const blogToDelete = blogAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const blogAtEnd = await Blog.find({}).populate("user");
    expect(blogAtEnd).toHaveLength(blogAtStart.length + 1);

    const titles = blogAtEnd.map((blog) => blog.title);
    expect(titles).not.toContain(blogToDelete.title);
  });

  test("Fail whit status 401 if user is not authorized", async () => {
    const blogsAtStart = await Blog.find({}).populate("user");
    const blogToDelete = blogsAtStart[0];

    token = null;

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(401);

    const blogsAtEnd = await Blog.find({}).populate("user");

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    expect(blogsAtStart).toEqual(blogsAtEnd);
  });
});

describe("Updating a blog", () => {
  // beforeEach(async () => {
  //   await Blog.deleteMany({});
  //   await Blog.insertMany(helper.initialblogs);
  //   //   const blogObjects = helper.initialblogs.map((blog) => new Blog(blog));
  //   //   const promiseArray = blogObjects.map((blog) => blog.save());
  //   //   await Promise.all(promiseArray);
  // });

  test("succeed whit status 200 if the id is correct", async () => {
    const blogsAtStart = await helper.blogsInDb();
    console.log(blogsAtStart);
    const blogToUpdate = blogsAtStart[0];
    console.log(blogToUpdate);

    await api
      .post(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 190 })
      .expect(200);

    const blogsAtEnd = await helper.blogsInDb();
    const updateBlog = blogsAtEnd[0];
    expect(blogsAtEnd).toHaveLength(helper.initialblogs.length);
    expect(updateBlog.likes).toBe(190);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
