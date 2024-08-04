const express = require('express');
const postController = require('../controllers/postController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

const router = express.Router();

router.get('/posts', cacheMiddleware, postController.getPosts);
router.get('/posts/:slug', cacheMiddleware, postController.getPostBySlug);

module.exports = router;
