const express = require("express");
const booksController = require("./controllers/booksController");
const usersController = require("./controllers/usersController");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser"); // Import body-parser
const validateBook = require("./middlewares/validateBook");

const app = express();
const port = 3000;

const staticMiddleware = express.static("public");

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

app.use(staticMiddleware); // Mount the static middleware

app.get("/books", booksController.getAllBooks);
app.get("/books/:id", booksController.getBookById);
app.post("/books", validateBook, booksController.createBook); // POST for creating books (can handle JSON data)
app.put("/books/:id", validateBook, booksController.updateBook);
app.delete("/books/:id", booksController.deleteBook); // DELETE for deleting books

// ... existing code for database connection and graceful shutdown

app.post('/users', usersController.createUser); // Route to create a new user
app.get('/users', usersController.getAllUsers); // Route to get all users
app.get("/users/search", usersController.searchUsers);
app.get("/users/with-books", usersController.getUsersWithBooks);
app.get('/users/:id', usersController.getUserById); // Route to get a user by ID
app.put('/users/:id', usersController.updateUser); // Route to update a user by ID
app.delete('/users/:id', usersController.deleteUser); // Route to delete a user by ID


app.listen(port, async () => {
    // ... existing code
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
  
  process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    // Perform cleanup tasks (e.g., close database connections)
    await sql.close();
    console.log("Database connection closed");
    process.exit(0); // Exit with code 0 indicating successful shutdown
  });