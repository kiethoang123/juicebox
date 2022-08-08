const express = require("express");
const tagsRouter = express.Router();

const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  const tagName = req.params.tagName;

  console.log("tagName", tagName);
  // read the tagname from the params
  try {
    const postsByTag = await getPostsByTagName(tagName);
    console.log("postsByTag", postsByTag);

    const filterPosts = postsByTag.filter((post) => {
      if (post.active) {
        return true;
      }
      if (req.user && req.user.id === post.author.id) {
        return true;
      }

      return false;
    });

    res.send({ filterPosts });
    // use our method to get posts by tag name from the db
    // send out an object to the client { posts: // the posts }
  } catch ({ name, message }) {
    // forward the name and message to the error handler
    res.status(500).send({ name, message });
  }
});

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

tagsRouter.get("/", (req, res) => {
  res.send({
    tags: [],
  });
});

module.exports = tagsRouter;