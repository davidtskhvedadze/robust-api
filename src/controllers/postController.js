const pool = require('../config/database');
const queryBuilder = require('../utils/queryBuilder');
const logger = require('../utils/logger');

// Handler to get a list of posts based on query parameters
const getPosts = async (req, res) => {
  // Extract query parameters from the request
  const { category, author, includeDrafts, limit, sort } = req.query;
  const params = [];
  
  // Define filters for the query
  const filters = {
    category,
    author,
    draft: includeDrafts === 'true' ? undefined : false,
  };

  // Build the SQL query using the queryBuilder utility
  let query = queryBuilder(`
    SELECT p.slug, p.title, p.content, p.draft, p.created_at, p.updated_at, 
           c.name as category, a.name as author 
    FROM posts p 
    JOIN categories c ON p.category_id = c.id 
    JOIN authors a ON p.author_id = a.id 
    WHERE 1=1`, filters, params);

  // Append sorting to the query if specified
  if (sort) {
    query += ` ORDER BY ${sort}`;
  }

  // Append limit to the query if specified
  if (limit) {
    params.push(limit);
    query += ` LIMIT $${params.length}`;
  }

  try {
    // Execute the query with the constructed parameters
    const result = await pool.query(query, params);
    
    // Respond with the retrieved posts and metadata
    res.json({
      data: result.rows,
      metadata: {
        count: result.rowCount,
        limit: limit ? parseInt(limit, 10) : null,
      },
    });
  } catch (error) {
    // Log the error and respond with a 500 status code
    logger.error('Error querying the database', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Handler to get a single post by its slug
const getPostBySlug = async (req, res) => {
  // Extract the slug from the request parameters
  const { slug } = req.params;
  const { includeDrafts } = req.query;

  try {
    // Execute the query to retrieve the post by its slug
    const result = await pool.query(`
      SELECT p.slug, p.title, p.content, p.draft, p.created_at, p.updated_at, 
             c.name as category, a.name as author 
      FROM posts p 
      JOIN categories c ON p.category_id = c.id 
      JOIN authors a ON p.author_id = a.id 
      WHERE p.slug = $1`, [slug]);

    // Check if the post was found
    if (result.rows.length > 0) {
      const post = result.rows[0];
      
      // If the post is a draft and drafts are not included, respond with a 403 status code
      if (post.draft && includeDrafts !== 'true') {
        return res.status(403).json({ error: 'Forbidden: Draft post' });
      }
      
      // Respond with the retrieved post
      res.json({ data: post });
    } else {
      // Respond with a 404 status code if the post was not found
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    // Log the error and respond with a 500 status code
    logger.error('Error querying the database', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
};