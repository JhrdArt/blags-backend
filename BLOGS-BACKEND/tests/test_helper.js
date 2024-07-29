const User = require("../models/user.model");
const Blog = require("../models/blog.model");

const initialblogs = [
  {
    author: "Jhon Doe",
    title: "Hola mundo",
    url: "holamundo.com",
    likes: 15,
  },
  {
    author: "Michael Don",
    title: "Js is the best",
    url: "js-is-the-best.com",
    likes: 254,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ auhtor: "willremovethissoon" });
  await blog.save();
  await blog.delete();
  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initialblogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
