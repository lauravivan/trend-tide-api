import HttpError from "../model/http-error.js";
import Post from "../model/post.js";

const newPost = async (req, res, next) => {
  if (
    "title" in req.body &&
    "content" in req.body &&
    "author" in req.body &&
    "creationDate" in req.body
  ) {
    try {
      const post = new Post(req.body);
      const postCreated = await post.save();

      if (postCreated) {
        res.status(201).json({
          message: "Your post has been published!",
        });
      }
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "It wasn't possible to create the post. Try again or verify data.",
        409
      );
      return next(error);
    }
  } else {
    const error = new HttpError(
      "Invalid request. Required: title, content, author, creationDate.",
      409
    );
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  const pid = req.params.pid;

  try {
    const deletedPost = await Post.findByIdAndDelete(pid);

    if (deletedPost) {
      res.status(201).json({
        message: "Post deleted successfully.",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const updatePost = async (req, res, next) => {
  const pid = req.params.pid;
  const dataToUpdate = {};

  if (req.body.title) {
    dataToUpdate["title"] = req.body.title;
  }

  if (req.body.content) {
    dataToUpdate["content"] = req.body.content;
  }

  if (req.file) {
    dataToUpdate["image"] = req.file.filename;
  }

  if (req.body.editDate) {
    dataToUpdate["editDate"] = req.body.editDate;
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(pid, dataToUpdate);

    if (updatedPost) {
      res.status(201).json({
        message: "Post updated successfully.",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate({
      path: "author",
      select: "_id username",
    });

    if (posts) {
      res.status(201).json(posts);
    }
  } catch (error) {
    return next(error);
  }
};

const getPostsByUser = async (req, res, next) => {
  const uid = req.params.uid;

  try {
    const posts = await Post.where({ author: uid });

    if (posts) {
      res.status(201).json({
        posts: posts,
      });
    }
  } catch (error) {
    return next(error);
  }
};

const getPost = async (req, res, next) => {
  const pid = req.params.pid;

  try {
    const post = await Post.findById(
      pid,
      "title content image author creationDate editDate"
    ).populate({ path: "author", select: "_id username" });

    if (post) {
      res.status(201).json(post);
    }
  } catch (error) {
    return next(error);
  }
};

export { newPost, deletePost, updatePost, getPosts, getPostsByUser, getPost };
