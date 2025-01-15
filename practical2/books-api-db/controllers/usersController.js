const User = require("../models/user");

class UsersController {
  static async createUser(req, res) {
    try {
      const user = req.body;
      const newUser = await User.createUser(user);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.getUserById(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: `User with ID ${id} not found` });
      }
    } catch (error) {
      console.error("Error retrieving user:", error.message); // Log detailed error
      res.status(500).json({ error: `Failed to retrieve user: ${error.message}` });
    }
  }
  

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = req.body;
      const success = await User.updateUser(id, updatedUser);
      if (success) {
        res.status(200).json({ message: "User updated successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const success = await User.deleteUser(id);
      if (success) {
        res.status(200).json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }

  static async searchUsers(req, res) {
    try {
      const { searchTerm } = req.query;
      const users = await User.searchUsers(searchTerm);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Error searching users" });
    }
  }

  static async getUsersWithBooks(_req, res) {
    try {
      const users = await User.getUsersWithBooks();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching users with books" });
    }
  }
}

module.exports = UsersController;
