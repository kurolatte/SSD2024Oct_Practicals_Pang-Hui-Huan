const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
  constructor(user_id, username, passwordHash, role) {
    this.id = user_id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = role;
  }

  static async createUser(username, passwordHash, role) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `
        INSERT INTO Users (username, passwordHash, role)
        OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.role
        VALUES (@username, @passwordHash, @role)
      `;

      const request = connection.request();
      request.input("username", sql.VarChar, username);
      request.input("passwordHash", sql.VarChar, passwordHash);
      request.input("role", sql.VarChar, role);

      const result = await request.query(sqlQuery);
      return result.recordset[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Error creating user");
    } finally {
      await connection.close();
    }
  }

  static async getUserByUsername(username) {
    const connection = await sql.connect(dbConfig);

    try {
      const sqlQuery = `
        SELECT * FROM Users WHERE username = @username
      `;

      const request = connection.request();
      request.input("username", sql.VarChar, username);

      const result = await request.query(sqlQuery);
      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        return new User(user.user_id, user.username, user.passwordHash, user.role);
      }
      return null; // User not found
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw new Error("Error fetching user by username");
    } finally {
      await connection.close();
    }
  }
}

module.exports = User;
