const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
app.use(bodyParser.json());

let users = JSON.parse(fs.readFileSync('database/users.json'));
let blogs = JSON.parse(fs.readFileSync('database/blog.json'));
app.post('/register', (req, res) => {
    const { username, password, fullName, age, email, gender } = req.body;

    if (!username || username.length < 3) {
        return res.status(400).send('Username must be at least 3 characters long.');
    }

    if (!password || password.length < 5) {
        return res.status(400).send('Password must be at least 5 characters long.');
    }

    if (!fullName || fullName.length < 10) {
        return res.status(400).send('Full name must be at least 10 characters long.');
    }

    if (!age || age < 10) {
        return res.status(400).send('Age must be at least 10.');
    }

    if (!email) {
        return res.status(400).send('Email is required.');
    }

    if (gender !== 'male' && gender !== 'female') {
        return res.status(400).send('Gender must be "male" or "female".');
    }
    const existingUser = users.find(user => user.username === username || user.email === email);
    if (existingUser) {
        return res.status(400).send('Username or email already exists.');
    }
    const newUser = { id: users.length + 1, username, password, fullName, age, email, gender };
    users.push(newUser);
    fs.writeFileSync('database/users.json', JSON.stringify(users, null, 2));

    res.status(201).send('User registered successfully.');
});

app.post('/login', (req, res) => {
    const { username, email, password } = req.body;
    const user = users.find(u => (u.username === username || u.email === email) && u.password === password);

    if (!user) {
        return res.status(404).send('User not found or incorrect password.');
    }

    res.send('Login successful!');
});

app.get('/profile/:identifier', (req, res) => {
    const { identifier } = req.params;
    const user = users.find(u => u.username === identifier || u.email === identifier);

    if (!user) {
        return res.status(404).send('User not found.');
    }

    res.send(user);
});
app.put('/profile/:identifier', (req, res) => {
    const { identifier } = req.params;
    const user = users.find(u => u.username === identifier || u.email === identifier);

    if (!user) {
        return res.status(404).send('User not found.');
    }
    const { username, password, fullName, age, email, gender } = req.body;
    user.username = username || user.username;
    user.password = password || user.password;
    user.fullName = fullName || user.fullName;
    user.age = age || user.age;
    user.email = email || user.email;
    user.gender = gender || user.gender;
    fs.writeFileSync('database/users.json', JSON.stringify(users, null, 2));

    res.send('Profile updated successfully.');
});
app.delete('/profile/:identifier', (req, res) => {
    const { identifier } = req.params;
    const index = users.findIndex(u => u.username === identifier || u.email === identifier);

    if (index === -1) {
        return res.status(404).send('User not found.');
    }

    users.splice(index, 1);
    fs.writeFileSync('database/users.json', JSON.stringify(users, null, 2));

    res.send('Profile deleted successfully.');
});

app.post('/blog', (req, res) => {
    const { title, slug, content, tags } = req.body;
    const newBlogPost = { id: blogs.length + 1, title, slug, content, tags, comments: [] };
    blogs.push(newBlogPost);
    fs.writeFileSync('database/blog.json', JSON.stringify(blogs, null, 2));

    res.status(201).send('Blog post created successfully.');
});
app.get('/blog', (req, res) => {
    res.send(blogs);
});
app.put('/blog/:id', (req, res) => {
    const { id } = req.params;
    const blogPost = blogs.find(post => post.id === parseInt(id));

    if (!blogPost) {
        return res.status(404).send('Blog post not found.');
    }
    const { title, slug, content, tags } = req.body;
    blogPost.title = title || blogPost.title;
    blogPost.slug = slug || blogPost.slug;
    blogPost.content = content || blogPost.content;
    blogPost.tags = tags || blogPost.tags;
    fs.writeFileSync('database/blog.json', JSON.stringify(blogs, null, 2));

    res.send('Blog post updated successfully.');
});

app.delete('/blog/:id', (req, res) => {
    const { id } = req.params;
    const index = blogs.findIndex(post => post.id === parseInt(id));

    if (index === -1) {
        return res.status(404).send('Blog post not found.');
    }
    blogs.splice(index, 1);

    fs.writeFileSync('database/blog.json', JSON.stringify(blogs, null, 2));

    res.send('Blog post deleted successfully.');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
