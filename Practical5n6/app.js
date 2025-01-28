const express = require("express");
const bodyParser = require("body-parser"); // Import body-parser
const booksController = require("./controllers/booksController");
const authController = require("./controllers/authController");
const authorizeUser = require("./middlewares/authorizeUser");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = 3000;

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// Auth entication routes
app.post("/register", authController.registerUser); // User registration route
app.post("/login", authController.login); // Login route

// Books routes (can handle JSON data in request body)
app.get("/books", authorizeUser, booksController.getAllBooks);
app.put(
  "/books/:id/availability",
  authorizeUser,
  booksController.updateBookAvailability
);

// Here's an example of a basic error handling middleware:
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).send("Internal Server Error");
});

// Get All Books Endpoint
app.get('/books', authenticateToken, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT title, author, availability FROM Books');
    res.status(200).json(result.recordset); // Returns an array of books
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error });
  }
});

// Update Book Availability Endpoint
app.put('/books/:bookId/availability', authenticateToken, async (req, res) => {
  const { bookId } = req.params;
  const { availability } = req.body;

  // Ensure the user is a librarian
  if (req.user.role !== 'librarian') {
    return res.status(403).json({ message: 'Access denied. Only librarians can update book availability.' });
  }

  // Validate availability input
  if (!['Y', 'N'].includes(availability)) {
    return res.status(400).json({ message: 'Invalid availability value. Use "Y" or "N".' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('availability', sql.Char, availability)
      .input('bookId', sql.Int, bookId)
      .query('UPDATE Books SET availability = @availability WHERE book_id = @bookId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.status(200).json({ message: 'Book availability updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error });
  }
});

// User Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Connect to the database and retrieve the user
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = result.recordset[0];

    // Compare the provided password with the hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role }, // Payload
      secretKey, // Secret key
      { expiresIn: '1h' } // Token expiration time
    );

    res.status(200).json({
      message: 'Login successful.',
      token, // Return the JWT token
      user: { userId: user.user_id, username: user.username, role: user.role }, // Optional user info
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.', error });
  }
});




app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});