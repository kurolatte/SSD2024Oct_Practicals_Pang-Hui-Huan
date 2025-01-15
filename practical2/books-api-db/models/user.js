const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
  static async createUser(user) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("username", sql.NVarChar, user.username)
        .input("email", sql.NVarChar, user.email)
        .query(
          "INSERT INTO Users (username, email) OUTPUT INSERTED.* VALUES (@username, @email)"
        );
      return result.recordset[0];
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  static async getAllUsers() {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("SELECT * FROM Users");
      return result.recordset;
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  static async getUserById(id) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM Users WHERE id = @id");
      return result.recordset[0] || null;
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  static async updateUser(id, updatedUser) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("username", sql.NVarChar, updatedUser.username)
        .input("email", sql.NVarChar, updatedUser.email)
        .query(
          "UPDATE Users SET username = @username, email = @email WHERE id = @id"
        );
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  static async deleteUser(id) {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Users WHERE id = @id");
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  static async searchUsers(searchTerm) {
    try {
      const pool = await sql.connect(dbConfig);
      const query = `
        SELECT *
        FROM Users
        WHERE username LIKE '%' + @searchTerm + '%'
          OR email LIKE '%' + @searchTerm + '%'
      `;
      const result = await pool
        .request()
        .input("searchTerm", sql.NVarChar, searchTerm)
        .query(query);
      return result.recordset;
    } catch (error) {
      throw error;
    } finally {
      sql.close();
    }
  }

  static async getUsersWithBooks() {
    const connection = await sql.connect(dbConfig);

    try {
      const query = `
        SELECT u.id AS user_id, u.username, u.email, b.id AS book_id, b.title, b.author
        FROM Users u
        LEFT JOIN UserBooks ub ON ub.user_id = u.id
        LEFT JOIN Books b ON ub.book_id = b.id
        ORDER BY u.username;
      `;

      const result = await connection.request().query(query);

      // Group users and their books
      const usersWithBooks = {};
      for (const row of result.recordset) {
        const userId = row.user_id;
        if (!usersWithBooks[userId]) {
          usersWithBooks[userId] = {
            id: userId,
            username: row.username,
            email: row.email,
            books: [],
          };
        }
        usersWithBooks[userId].books.push({
          id: row.book_id,
          title: row.title,
          author: row.author,
        });
      }

      return Object.values(usersWithBooks);
    } catch (error) {
      throw new Error("Error fetching users with books");
    } finally {
      await connection.close();
    }
  }
}

module.exports = User;
