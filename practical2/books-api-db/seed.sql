--CREATE TABLE Users (
--  id INT PRIMARY KEY IDENTITY,
--  username VARCHAR(50) NOT NULL UNIQUE,
--  email VARCHAR(100) NOT NULL UNIQUE
--);

--CREATE TABLE UserBooks (
--  id INT PRIMARY KEY IDENTITY,
--  user_id INT FOREIGN KEY REFERENCES Users(id),
--  book_id INT FOREIGN KEY REFERENCES Books(id)
--);

-- Insert sample books
INSERT INTO Books (title, author)
VALUES
  ('To Kill a Mockingbird', 'Harper Lee'),
  ('The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams'),
  ('Dune', 'Frank Herbert'),
  ('The Great Gatsby', 'F. Scott Fitzgerald');

-- Insert sample users
INSERT INTO Users (username, email)
VALUES
  ('user1', 'user1@example.com'),
  ('user2', 'user2@example.com'),
  ('user3', 'user3@example.com');

-- Insert relationships between users and books
INSERT INTO UserBooks (user_id, book_id)
VALUES
  (1, 1),  -- User 1 has book 1
  (1, 2),  -- User 1 has book 2
  (1, 4),  -- User 1 has book 4
  (2, 3),  -- User 2 has book 3
  (2, 5),  -- User 2 has book 5
  (3, 1),  -- User 3 has book 1
  (3, 6);  -- User 3 has book 6

-- SELECT * FROM Books;
-- SELECT * FROM Users;
-- SELECT * FROM UserBooks;