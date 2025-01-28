const Book = require("../models/Book");

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving books");
  }
};

const updateBookAvailability = async (req, res) => {
  const bookId = parseInt(req.params.id);
  const bookData = req.body;

  try {
    const updatedBook = await Book.updateBookAvailability(bookId, bookData);
    if (!updatedBook) {
      return res.status(404).send("Book not found");
    }
    res.json(updatedBook);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating book");
  }
};

module.exports = {
  getAllBooks,
  updateBookAvailability,
};