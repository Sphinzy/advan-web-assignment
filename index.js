const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

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
const UPLOADS_DIR = path.join(__dirname, "uploads");

// ================= MULTER CONFIGURATION =================
// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// ================= FILE HELPERS =================
const initFile = (file) => {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
};

const readData = (file) => {
    initFile(file);
    const content = fs.readFileSync(file, "utf8").trim();
    if (!content) return [];
    return JSON.parse(content);
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const getNextId = (arr) =>
    arr.length ? Math.max(...arr.map((i) => i.id)) + 1 : 1;

// Helper to construct URL for uploaded files
const getFileUrl = (filename) => {
    return filename ? `http://localhost:${PORT}/uploads/${filename}` : null;
};

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
        endpoints: {
            auth: [
                "POST /api/auth/register",
                "POST /api/auth/login"
            ],
            users: [
                "GET /api/users",
                "GET /api/users/:id"
            ],
            posts: [
                "GET /api/posts",
                "GET /api/posts/:id",
                "GET /api/posts/author/:authorId",
                "POST /api/posts (with image upload)",
                "PUT /api/posts/:id (with optional image upload)",
                "DELETE /api/posts/:id"
            ],
            categories: [
                "GET /api/categories",
                "GET /api/categories/:id",
                "POST /api/categories",
                "PUT /api/categories/:id",
                "DELETE /api/categories/:id"
            ],
            jobs: [
                "GET /api/jobs",
                "GET /api/jobs/:id",
                "GET /api/jobs/author/:authorId",
                "POST /api/jobs (with image upload)",
                "PUT /api/jobs/:id (with optional image upload)",
                "DELETE /api/jobs/:id"
            ],
            files: "GET /uploads/:filename"
        }
    });
});

// ================= USERS =================
app.get("/api/users", (req, res) => {
    const users = readData(USERS_FILE);
    // Don't return passwords
    const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
    res.json({ success: true, data: usersWithoutPasswords });
});

app.get("/api/users/:id", (req, res) => {
    const users = readData(USERS_FILE);
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
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
        firstName: firstName || "",
        lastName: lastName || "",
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
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
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
    const categories = readData(CATEGORIES_FILE);

    const result = posts.map(p => {
        const user = users.find(u => u.id === p.authorId);
        const category = categories.find(c => c.id === p.categoryId);

        return {
            ...p,
            imageUrl: p.image ? getFileUrl(p.image) : null,
            author: user
                ? {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    avatar: user.avatar
                }
                : null,
            category: category ? { id: category.id, name: category.name } : null
        };
    });

    res.json({ success: true, data: result });
});

// CREATE post with file upload
app.post("/api/posts", authenticateToken, upload.single('image'), (req, res) => {
    const { title, content, categoryId } = req.body;

    if (!title || !content)
        return res.status(400).json({ success: false, message: "Title & content required" });

    // Validate category exists
    const categories = readData(CATEGORIES_FILE);
    if (categoryId) {
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }
    }

    const posts = readData(POSTS_FILE);

    const newPost = {
        id: getNextId(posts),
        title,
        content,
        image: req.file ? req.file.filename : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        authorId: req.user.sub,
        createdAt: new Date().toISOString(),
        updatedAt: null
    };

    posts.push(newPost);
    writeData(POSTS_FILE, posts);

    // Return post with full URL and author info
    const users = readData(USERS_FILE);
    const author = users.find(u => u.id === req.user.sub);
    const category = categories.find(c => c.id === newPost.categoryId);

    const postWithDetails = {
        ...newPost,
        imageUrl: req.file ? getFileUrl(req.file.filename) : null,
        author: author
            ? {
                id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                email: author.email,
                avatar: author.avatar
            }
            : null,
        category: category ? { id: category.id, name: category.name } : null
    };

    res.status(201).json({ success: true, data: postWithDetails });
});

// GET post by id
app.get("/api/posts/:id", (req, res) => {
    const posts = readData(POSTS_FILE);
    const users = readData(USERS_FILE);
    const categories = readData(CATEGORIES_FILE);

    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post)
        return res.status(404).json({ success: false, message: "Post not found" });

    const author = users.find(u => u.id === post.authorId);
    const category = categories.find(c => c.id === post.categoryId);

    res.json({
        success: true,
        data: {
            ...post,
            imageUrl: post.image ? getFileUrl(post.image) : null,
            author: author
                ? {
                    id: author.id,
                    name: `${author.firstName} ${author.lastName}`,
                    email: author.email,
                    avatar: author.avatar
                }
                : null,
            category: category ? { id: category.id, name: category.name } : null
        }
    });
});

// GET posts by author
app.get("/api/posts/author/:authorId", (req, res) => {
    const posts = readData(POSTS_FILE);
    const users = readData(USERS_FILE);
    const categories = readData(CATEGORIES_FILE);

    const authorId = parseInt(req.params.authorId);
    const author = users.find(u => u.id === authorId);

    if (!author)
        return res.status(404).json({ success: false, message: "Author not found" });

    const result = posts
        .filter(p => p.authorId === authorId)
        .map(p => {
            const category = categories.find(c => c.id === p.categoryId);
            return {
                ...p,
                imageUrl: p.image ? getFileUrl(p.image) : null,
                author: {
                    id: author.id,
                    name: `${author.firstName} ${author.lastName}`,
                    email: author.email,
                    avatar: author.avatar
                },
                category: category ? { id: category.id, name: category.name } : null
            };
        });

    res.json({ success: true, data: result });
});

// UPDATE post with optional file upload
app.put("/api/posts/:id", authenticateToken, upload.single('image'), (req, res) => {
    const { title, content, categoryId } = req.body;
    const posts = readData(POSTS_FILE);
    const users = readData(USERS_FILE);
    const categories = readData(CATEGORIES_FILE);

    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post)
        return res.status(404).json({ success: false, message: "Post not found" });

    // Only author can update
    if (post.authorId !== req.user.sub)
        return res.status(403).json({ success: false, message: "Access denied" });

    // Validate category if provided
    if (categoryId) {
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }
        post.categoryId = parseInt(categoryId);
    }

    if (title) post.title = title;
    if (content) post.content = content;

    // If new image uploaded, update the filename
    if (req.file) {
        // Delete old image if exists
        if (post.image) {
            const oldImagePath = path.join(UPLOADS_DIR, post.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        post.image = req.file.filename;
    }

    post.updatedAt = new Date().toISOString();

    writeData(POSTS_FILE, posts);

    // Return post with full URL and author info
    const author = users.find(u => u.id === post.authorId);
    const category = categories.find(c => c.id === post.categoryId);

    const updatedPost = {
        ...post,
        imageUrl: post.image ? getFileUrl(post.image) : null,
        author: author
            ? {
                id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                email: author.email,
                avatar: author.avatar
            }
            : null,
        category: category ? { id: category.id, name: category.name } : null
    };

    res.json({ success: true, data: updatedPost });
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

    // Delete associated image if exists
    const post = posts[index];
    if (post.image) {
        const imagePath = path.join(UPLOADS_DIR, post.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    const deleted = posts.splice(index, 1)[0];
    writeData(POSTS_FILE, posts);

    res.json({ success: true, data: deleted });
});

// ================= JOBS =================

// GET all jobs (with category name)
app.get("/api/jobs", (req, res) => {
    const jobs = readData(JOBS_FILE);
    const categories = readData(CATEGORIES_FILE);
    const users = readData(USERS_FILE);

    const result = jobs.map(j => {
        const category = categories.find(c => c.id === j.categoryId);
        const author = users.find(u => u.id === j.authorId);

        return {
            ...j,
            imageUrl: j.image ? getFileUrl(j.image) : null,
            categoryName: category ? category.name : null,
            author: author
                ? {
                    id: author.id,
                    name: `${author.firstName} ${author.lastName}`,
                    email: author.email,
                    avatar: author.avatar
                }
                : null
        };
    });

    res.json({ success: true, data: result });
});

// GET single job by id
app.get("/api/jobs/:id", (req, res) => {
    const jobs = readData(JOBS_FILE);
    const categories = readData(CATEGORIES_FILE);
    const users = readData(USERS_FILE);

    const job = jobs.find(j => j.id === parseInt(req.params.id));
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const category = categories.find(c => c.id === job.categoryId);
    const author = users.find(u => u.id === job.authorId);

    const jobWithDetails = {
        ...job,
        imageUrl: job.image ? getFileUrl(job.image) : null,
        category: category ? { id: category.id, name: category.name } : null,
        author: author
            ? {
                id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                email: author.email,
                avatar: author.avatar
            }
            : null
    };

    res.json({ success: true, data: jobWithDetails });
});

// CREATE a new job with file upload
app.post("/api/jobs", authenticateToken, upload.single('image'), (req, res) => {
    const {
        title, type, location, description, requirements,
        salary, deadline, contactEmail, categoryId
    } = req.body;

    if (!title || !type || !contactEmail)
        return res.status(400).json({ success: false, message: "Title, type, and contact email required" });

    // Validate category if provided
    if (categoryId) {
        const categories = readData(CATEGORIES_FILE);
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }
    }

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
        categoryId: categoryId ? parseInt(categoryId) : null,
        image: req.file ? req.file.filename : null,
        authorId: req.user.sub,
        createdAt: new Date().toISOString(),
        updatedAt: null
    };

    jobs.push(newJob);
    writeData(JOBS_FILE, jobs);

    // Return job with full URL and author info
    const users = readData(USERS_FILE);
    const categories = readData(CATEGORIES_FILE);
    const author = users.find(u => u.id === req.user.sub);
    const category = categories.find(c => c.id === newJob.categoryId);

    const jobWithDetails = {
        ...newJob,
        imageUrl: req.file ? getFileUrl(req.file.filename) : null,
        author: author
            ? {
                id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                email: author.email,
                avatar: author.avatar
            }
            : null,
        category: category ? { id: category.id, name: category.name } : null
    };

    res.status(201).json({ success: true, data: jobWithDetails });
});

// GET jobs by author
app.get("/api/jobs/author/:authorId", (req, res) => {
    const jobs = readData(JOBS_FILE);
    const users = readData(USERS_FILE);
    const categories = readData(CATEGORIES_FILE);

    const authorId = parseInt(req.params.authorId);
    const author = users.find(u => u.id === authorId);

    if (!author)
        return res.status(404).json({ success: false, message: "Author not found" });

    const result = jobs
        .filter(j => j.authorId === authorId)
        .map(j => {
            const category = categories.find(c => c.id === j.categoryId);
            return {
                ...j,
                imageUrl: j.image ? getFileUrl(j.image) : null,
                author: {
                    id: author.id,
                    name: `${author.firstName} ${author.lastName}`,
                    email: author.email,
                    avatar: author.avatar
                },
                category: category ? { id: category.id, name: category.name } : null
            };
        });

    res.json({ success: true, data: result });
});

// UPDATE job with optional file upload
app.put("/api/jobs/:id", authenticateToken, upload.single('image'), (req, res) => {
    const {
        title, type, location, description, requirements,
        salary, deadline, contactEmail, categoryId
    } = req.body;

    const jobs = readData(JOBS_FILE);
    const users = readData(USERS_FILE);
    const categories = readData(CATEGORIES_FILE);

    const job = jobs.find(j => j.id === parseInt(req.params.id));

    if (!job)
        return res.status(404).json({ success: false, message: "Job not found" });

    // Only author can update
    if (job.authorId !== req.user.sub)
        return res.status(403).json({ success: false, message: "Access denied" });

    // Validate category if provided
    if (categoryId) {
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }
        job.categoryId = parseInt(categoryId);
    }

    // Update fields
    if (title) job.title = title;
    if (type) job.type = type;
    if (location !== undefined) job.location = location;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (salary !== undefined) job.salary = salary;
    if (deadline !== undefined) job.deadline = deadline;
    if (contactEmail) job.contactEmail = contactEmail;

    // If new image uploaded, update the filename
    if (req.file) {
        // Delete old image if exists
        if (job.image) {
            const oldImagePath = path.join(UPLOADS_DIR, job.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        job.image = req.file.filename;
    }

    job.updatedAt = new Date().toISOString();
    writeData(JOBS_FILE, jobs);

    // Return job with full URL and author info
    const author = users.find(u => u.id === job.authorId);
    const category = categories.find(c => c.id === job.categoryId);

    const updatedJob = {
        ...job,
        imageUrl: job.image ? getFileUrl(job.image) : null,
        author: author
            ? {
                id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                email: author.email,
                avatar: author.avatar
            }
            : null,
        category: category ? { id: category.id, name: category.name } : null
    };

    res.json({ success: true, data: updatedJob });
});

// DELETE job
app.delete("/api/jobs/:id", authenticateToken, (req, res) => {
    const jobs = readData(JOBS_FILE);
    const index = jobs.findIndex(j => j.id === parseInt(req.params.id));

    if (index === -1)
        return res.status(404).json({ success: false, message: "Job not found" });

    // Only author can delete
    if (jobs[index].authorId !== req.user.sub)
        return res.status(403).json({ success: false, message: "Access denied" });

    // Delete associated image if exists
    const job = jobs[index];
    if (job.image) {
        const imagePath = path.join(UPLOADS_DIR, job.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    const deleted = jobs.splice(index, 1)[0];
    writeData(JOBS_FILE, jobs);

    res.json({ success: true, data: deleted });
});

// ================= SEARCH =================
app.get("/api/search", (req, res) => {
    const { q, type } = req.query;

    if (!q) {
        return res.status(400).json({
            success: false,
            message: "Search query required"
        });
    }

    const searchTerm = q.toLowerCase();
    const results = {};

    // Search posts
    if (!type || type === 'posts') {
        const posts = readData(POSTS_FILE);
        const users = readData(USERS_FILE);
        const categories = readData(CATEGORIES_FILE);

        results.posts = posts
            .filter(p =>
                p.title.toLowerCase().includes(searchTerm) ||
                p.content.toLowerCase().includes(searchTerm)
            )
            .map(p => {
                const user = users.find(u => u.id === p.authorId);
                const category = categories.find(c => c.id === p.categoryId);
                return {
                    ...p,
                    imageUrl: p.image ? getFileUrl(p.image) : null,
                    author: user ? {
                        id: user.id,
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        avatar: user.avatar
                    } : null,
                    category: category ? { id: category.id, name: category.name } : null
                };
            });
    }

    // Search jobs
    if (!type || type === 'jobs') {
        const jobs = readData(JOBS_FILE);
        const categories = readData(CATEGORIES_FILE);
        const users = readData(USERS_FILE);

        results.jobs = jobs
            .filter(j =>
                j.title.toLowerCase().includes(searchTerm) ||
                j.description.toLowerCase().includes(searchTerm) ||
                j.location.toLowerCase().includes(searchTerm) ||
                j.type.toLowerCase().includes(searchTerm)
            )
            .map(j => {
                const category = categories.find(c => c.id === j.categoryId);
                const author = users.find(u => u.id === j.authorId);
                return {
                    ...j,
                    imageUrl: j.image ? getFileUrl(j.image) : null,
                    categoryName: category ? category.name : null,
                    author: author ? {
                        id: author.id,
                        name: `${author.firstName} ${author.lastName}`,
                        email: author.email,
                        avatar: author.avatar
                    } : null
                };
            });
    }

    res.json({ success: true, data: results });
});

// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${UPLOADS_DIR}`);

    // Initialize all JSON files
    initFile(USERS_FILE);
    initFile(POSTS_FILE);
    initFile(CATEGORIES_FILE);
    initFile(JOBS_FILE);

    console.log("✅ All JSON files initialized");
});