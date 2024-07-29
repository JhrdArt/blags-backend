const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const helper = require("./test_helper");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);

//USER
describe("When create a new user", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("password", 10);
    const user = new User({
      username: "root",
      passwordHash,
    });

    await user.save();
  });

  test("user is returned", async () => {
    const userAtStart = await helper.usersInDb();

    expect(userAtStart[0].username).toBe("root");
  });

  test("Creation succeeds white a fresh username", async () => {
    const userAtstart = await helper.usersInDb();

    const newUser = {
      username: "Jhordart",
      name: "Samir Arteaga",
      password: "sahir",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("content-type", /application\/json/);

    const userAtEnd = await helper.usersInDb();
    expect(userAtEnd).toHaveLength(userAtstart.length + 1);

    const username = await userAtEnd.map((u) => u.username);
    expect(username).toContain(newUser.username);
  });

  test("creation fails if username is missing", async () => {
    const userAtStart = await helper.usersInDb();

    const newUser = {
      name: "Sam",
      password: "12345",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    expect(response.body.error).toContain("Username and password are required");

    const userAtEnd = await helper.usersInDb();
    expect(userAtEnd).toHaveLength(userAtStart.length);
  });

  test("Creation fail if username is shorter than 3 characters", async () => {
    const userAtStart = await helper.usersInDb();
    const newUser = {
      username: "jh",
      name: "sahir art",
      password: "2324234",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);
    expect(response.body.error).toBe(
      "The password and username must have at least 3 characters"
    );
    const userAtEnd = await helper.usersInDb();

    expect(userAtEnd).toHaveLength(userAtStart.length);
  });

  test("Creation fail if password is shorter than 3 characters", async () => {
    const userAtStart = await helper.usersInDb();
    const newUser = {
      username: "SahirSamir",
      name: "Alejandro García",
      password: "12",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);
    expect(response.body.error).toBe(
      "The password and username must have at least 3 characters"
    );

    const userAtEnd = await helper.usersInDb();

    expect(userAtEnd).toHaveLength(userAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
