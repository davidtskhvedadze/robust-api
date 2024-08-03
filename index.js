const express = require('express');
const app = express();
const posts = [
    { id: 1, title: "Understanding JavaScript Closures", slug: "understanding-javascript-closures", category: "Computer Science", author: "John Smith"},
    { id: 2, title: "A Beginner's Guide to React", slug: "a-beginners-guide-to-react", category: "React", author: "Jane Smith"}
];

app.use(express.json());

app.get('/posts', (req, res) => {
    const { category, author } = req.query;
    let filteredPosts = posts;
  
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }
    if (author) {
      filteredPosts = filteredPosts.filter(post => post.author === author);
    }
  
    res.json(filteredPosts);
});

app.get('/posts/:slug', (req, res) => {
    const { slug } = req.params;
    const post = posts.find(post => post.slug === slug);
  
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});