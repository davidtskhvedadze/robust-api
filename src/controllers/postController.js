const pool = require('../config/database');
const queryBuilder = require('../utils/queryBuilder');
const logger = require('../utils/logger');

const getPosts = async (req, res) => {
  const { category, author, includeDrafts, limit, sort } = req.query;
  const params = [];
  const filters = {
    category,
    author,
    draft: includeDrafts === 'true' ? undefined : false,
  };
  let query = queryBuilder(`
    SELECT p.slug, p.title, p.content, p.draft, p.created_at, p.updated_at, 
           c.name as category, a.name as author 
    FROM posts p 
    JOIN categories c ON p.category_id = c.id 
    JOIN authors a ON p.author_id = a.id 
    WHERE 1=1`, filters, params);

  if (sort) {
    query += ` ORDER BY ${sort}`;
  }
  if (limit) {
    params.push(limit);
    query += ` LIMIT $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json({
      data: result.rows,
      metadata: {
        count: result.rowCount,
        limit: limit ? parseInt(limit, 10) : null,
      },
    });
  } catch (error) {
    logger.error('Error querying the database', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getPostBySlug = async (req, res) => {
  const { slug } = req.params;
  const { includeDrafts } = req.query;

  try {
    const result = await pool.query(`
      SELECT p.slug, p.title, p.content, p.draft, p.created_at, p.updated_at, 
             c.name as category, a.name as author 
      FROM posts p 
      JOIN categories c ON p.category_id = c.id 
      JOIN authors a ON p.author_id = a.id 
      WHERE p.slug = $1`, [slug]);
    if (result.rows.length > 0) {
      const post = result.rows[0];
      if (post.draft && includeDrafts !== 'true') {
        return res.status(403).json({ error: 'Forbidden: Draft post' });
      }
      res.json({ data: post });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    logger.error('Error querying the database', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
};
