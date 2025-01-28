const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Book {
  constructor(book_id, title, author, availability) {
    this.id = book_id;
    this.title = title;
    this.author = author;
    this.availability = availability;
  }

  static async getAllBooks() {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Books`; // Replace with your actual table name

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset.map(
      (row) => new Book(row.book_id, row.title, row.author, row.availability)
    ); // Convert rows to Book objects
  }

  static async getBookById(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Books WHERE book_id = @id`; // Parameterized query

    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset[0]
      ? new Book(
          result.recordset[0].book_id,
          result.recordset[0].title,
          result.recordset[0].author,
          result.recordset[0].availability
        )
      : null; // Handle book not found
  }

  static async updateBookAvailability(id, bookData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `UPDATE Books SET availability = @availability WHERE book_id = @id`; // Parameterized query

    const request = connection.request();
    request.input("id", id);
    request.input("availability", bookData.availability);

    await request.query(sqlQuery);

    connection.close();

    return this.getBookById(id); // returning the updated book data
  }
}

module.exports = Book;