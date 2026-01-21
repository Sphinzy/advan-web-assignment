const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const JWT_SECRET = "super_secret_key_123";

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= FILE PATHS =================
const USERS_FILE = path.join(__dirname, "users.json");
const POSTS_FILE = path.join(__dirname, "posts.json");
const CATEGORIES_FILE = path.join(__dirname, "categories.json");
const JOBS_FILE = path.join(__dirname, "jobs.json");

// ================= FILE HELPERS =================
const initFile = (file) => {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
};

const readData = (file) => {
    initFile(file);
    const content = fs.readFileSync(file, "utf8").trim();
    if (!content) return []; // <-- handle empty file
    return JSON.parse(content);
};


const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const getNextId = (arr) =>
    arr.length ? Math.max(...arr.map((i) => i.id)) + 1 : 1;

// ================= AUTH MIDDLEWARE =================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ success: false, message: "No token" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ success: false, message: "Invalid token" });
        req.user = user;
        next();
    });
};

// ================= ROOT =================
app.get("/", (req, res) => {
    res.json({
        message: "Blog & Jobs API Running",
        endpoints: [
            "/api/auth/register",
            "/api/auth/login",
            "/api/users",
            "/api/posts",
            "/api/categories",
            "/api/jobs"
        ]
    });
});

// ================= USERS =================
app.get("/api/users", (req, res) => {
    const users = readData(USERS_FILE);
    res.json({ success: true, data: users });
});

app.get("/api/users/:id", (req, res) => {
    const users = readData(USERS_FILE);
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
});

// ================= AUTH =================
app.post("/api/auth/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ result: false, message: "Email & password required" });

    if (password.length < 6)
        return res.status(400).json({ result: false, message: "Password min 6 characters" });

    const users = readData(USERS_FILE);
    if (users.find(u => u.email === email))
        return res.status(400).json({ result: false, message: "Email exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: getNextId(users),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar: "https://i.pinimg.com/236x/d6/5c/fa/d65cfa8b47227df12fb97217e8f940e3.jpg",
        registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    const token = jwt.sign({ sub: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
        result: true,
        message: "Register successful",
        data: {
            user: {
                id: newUser.id,
                firstName,
                lastName,
                email,
                avatar: newUser.avatar
            },
            token
        }
    });
});

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    const users = readData(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (!user)
        return res.status(401).json({ result: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return res.status(401).json({ result: false, message: "Invalid credentials" });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
        result: true,
        message: "Login successful",
        data: {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar
            },
            token
        }
    });
});

// ================= CATEGORIES =================
app.get("/api/categories", (req, res) => {
    const categories = readData(CATEGORIES_FILE);
    res.json({ success: true, data: categories });
});

app.get("/api/categories/:id", (req, res) => {
    const categories = readData(CATEGORIES_FILE);
    const category = categories.find(c => c.id === parseInt(req.params.id));

    if (!category)
        return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, data: category });
});

app.post("/api/categories", authenticateToken, (req, res) => {
    const { name } = req.body;

    if (!name)
        return res.status(400).json({ success: false, message: "Category name required" });

    const categories = readData(CATEGORIES_FILE);

    const newCategory = {
        id: getNextId(categories),
        name,
        createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    writeData(CATEGORIES_FILE, categories);

    res.status(201).json({ success: true, data: newCategory });
});
app.put("/api/categories/:id", authenticateToken, (req, res) => {
    const { name } = req.body;
    const categories = readData(CATEGORIES_FILE);

    const category = categories.find(c => c.id === parseInt(req.params.id));
    if (!category)
        return res.status(404).json({ success: false, message: "Category not found" });

    if (!name)
        return res.status(400).json({ success: false, message: "Category name required" });

    category.name = name;
    category.updatedAt = new Date().toISOString();

    writeData(CATEGORIES_FILE, categories);
    res.json({ success: true, data: category });
});
app.delete("/api/categories/:id", authenticateToken, (req, res) => {
    const categories = readData(CATEGORIES_FILE);
    const index = categories.findIndex(c => c.id === parseInt(req.params.id));

    if (index === -1)
        return res.status(404).json({ success: false, message: "Category not found" });

    const deleted = categories.splice(index, 1)[0];
    writeData(CATEGORIES_FILE, categories);

    res.json({ success: true, data: deleted });
});


// ================= POSTS =================
app.get("/api/posts", (req, res) => {
    const posts = readData(POSTS_FILE);
    const users = readData(USERS_FILE);

    const result = posts.map(p => {
        const user = users.find(u => u.id === p.authorId);

        return {
            ...p,
            author: user
                ? {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    avatar: user.avatar
                }
                : null
        };
    });

    res.json({ success: true, data: result });
});

app.post("/api/posts", authenticateToken, (req, res) => {
    const { title, content, categoryId, image } = req.body;

    if (!title || !content)
        return res.status(400).json({ success: false, message: "Title & content required" });

    const posts = readData(POSTS_FILE);

    const newPost = {
        id: getNextId(posts),
        title,
        content,
        image: image || "https://t4.ftcdn.net/jpg/16/79/44/21/360_F_1679442196_OEsi0AFKie6hYMBpvmXwwRgRYGV4U6Lz.jpg",
        categoryId,
        authorId: req.user.sub,
        createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    writeData(POSTS_FILE, posts);

    res.status(201).json({ success: true, data: newPost });
});
// GET post by id
app.get("/api/posts/:id", (req, res) => {
    const posts = readData(POSTS_FILE);
    const users = readData(USERS_FILE);

    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post)
        return res.status(404).json({ success: false, message: "Post not found" });

    const author = users.find(u => u.id === post.authorId);

    res.json({
        success: true,
        data: {
            ...post,
            author: author
                ? {
                    id: author.id,
                    name: `${author.firstName} ${author.lastName}`,
                    email: author.email,
                    avatar: author.avatar
                }
                : null
        }
    });
});
// GET posts by author
app.get("/api/posts/author/:authorId", (req, res) => {
    const posts = readData(POSTS_FILE);
    const users = readData(USERS_FILE);

    const authorId = parseInt(req.params.authorId);
    const author = users.find(u => u.id === authorId);

    if (!author)
        return res.status(404).json({ success: false, message: "Author not found" });

    const result = posts
        .filter(p => p.authorId === authorId)
        .map(p => ({
            ...p,
            author: {
                id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                email: author.email,
                avatar: author.avatar
            }
        }));

    res.json({ success: true, data: result });
});
// UPDATE post
app.put("/api/posts/:id", authenticateToken, (req, res) => {
    const { title, content, categoryId, image } = req.body;
    const posts = readData(POSTS_FILE);

    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post)
        return res.status(404).json({ success: false, message: "Post not found" });

    // Only author can update
    if (post.authorId !== req.user.sub)
        return res.status(403).json({ success: false, message: "Access denied" });

    if (title) post.title = title;
    if (content) post.content = content;
    if (categoryId !== undefined) post.categoryId = categoryId;
    if (image) post.image = image;

    post.updatedAt = new Date().toISOString();

    writeData(POSTS_FILE, posts);
    res.json({ success: true, data: post });
});
// DELETE post
app.delete("/api/posts/:id", authenticateToken, (req, res) => {
    const posts = readData(POSTS_FILE);
    const index = posts.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1)
        return res.status(404).json({ success: false, message: "Post not found" });

    // Only author can delete
    if (posts[index].authorId !== req.user.sub)
        return res.status(403).json({ success: false, message: "Access denied" });

    const deleted = posts.splice(index, 1)[0];
    writeData(POSTS_FILE, posts);

    res.json({ success: true, data: deleted });
});


// ================= JOBS =================

// GET all jobs (with category name)
app.get("/api/jobs", (req, res) => {
    const jobs = readData(JOBS_FILE);
    const categories = readData(CATEGORIES_FILE);

    const result = jobs.map(j => {
        const category = categories.find(c => c.id === j.categoryId);
        return {
            ...j,
            categoryName: category ? category.name : null
        };
    });

    res.json({ success: true, data: result });
});

// GET single job by id
app.get("/api/jobs/:id", (req, res) => {
    const jobs = readData(JOBS_FILE);
    const job = jobs.find(j => j.id === parseInt(req.params.id));
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, data: job });
});

// CREATE a new job (protected)
app.post("/api/jobs", authenticateToken, (req, res) => {
    const {
        title, type, location, description, requirements,
        salary, deadline, contactEmail, categoryId, image
    } = req.body;

    if (!title || !type || !contactEmail)
        return res.status(400).json({ success: false, message: "Title, type, and contact email required" });

    const jobs = readData(JOBS_FILE);

    const newJob = {
        id: getNextId(jobs),
        title,
        type,
        location: location || "",
        description: description || "",
        requirements: requirements || "",
        salary: salary || "",
        deadline: deadline || "",
        contactEmail,
        categoryId: categoryId || null,
        image: image || "https://t4.ftcdn.net/jpg/16/79/44/21/360_F_1679442196_OEsi0AFKie6hYMBpvmXwwRgRYGV4U6Lz.jpg", // <-- default image
        createdAt: new Date().toISOString()
    };

    jobs.push(newJob);
    writeData(JOBS_FILE, jobs);

    res.status(201).json({ success: true, data: newJob });
});
// GET jobs by author
app.get("/api/jobs/author/:authorId", (req, res) => {
    const jobs = readData(JOBS_FILE);
    const users = readData(USERS_FILE);

    const authorId = parseInt(req.params.authorId);
    const author = users.find(u => u.id === authorId);

    if (!author)
        return res.status(404).json({ success: false, message: "Author not found" });

    const result = jobs
        .filter(j => j.authorId === authorId)
        .map(j => ({
            ...j,
            author: {
                id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                email: author.email,
                avatar: author.avatar
            }
        }));

    res.json({ success: true, data: result });
});

// DELETE job
app.delete("/api/jobs/:id", authenticateToken, (req, res) => {
    const jobs = readData(JOBS_FILE);
    const index = jobs.findIndex(j => j.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, message: "Job not found" });

    const deleted = jobs.splice(index, 1)[0];
    writeData(JOBS_FILE, jobs);
    res.json({ success: true, data: deleted });
});


// ================= START SERVER =================
app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);
