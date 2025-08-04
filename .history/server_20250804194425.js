// A simple Node.js and Express server for a to-do list API.

const express = require('express');
const app = express();
// Use the environment port for deployment, or default to 3000 for local development.
const PORT = process.env.PORT || 3000;

// Enable CORS for a basic API. This allows a front-end app on a different origin to make requests.
const cors = require('cors');
app.use(cors());

// Middleware to parse JSON bodies from incoming requests.
app.use(express.json());

// --- In-memory data store for the to-do list ---
let todos = [
  { id: 1, text: 'Prepare for the interview', completed: false },
  { id: 2, text: 'Review Node.js and Express', completed: true },
  { id: 3, text: 'Create a simple app', completed: false },
  { id: 4, text: 'Read a book about JavaScript', completed: false },
  { id: 5, text: 'Go for a run', completed: false },
  { id: 6, text: 'Plan next week\'s tasks', completed: true },
  { id: 7, text: 'Buy groceries', completed: false },
  { id: 8, text: 'Call a friend', completed: false },
  { id: 9, text: 'Organize the desktop', completed: false },
  { id: 10, text: 'Write a blog post', completed: false },
  { id: 11, text: 'Practice coding challenges', completed: true },
  { id: 12, text: 'Water the plants', completed: false },
];
let nextId = 13; // To generate unique IDs for new todos.

// --- GetStream Chat Configuration ---
// Note: You must install the 'stream-chat' package with `npm install stream-chat`
const { StreamChat } = require('stream-chat');
const apiKey = 'n6ghcfkzqn6u';
const apiSecret = 'dhk6cn5ux44n9r5ac525dfb3h537ryg8yzcafrzmnx3h6njxngpaazts25hre8ej';
const client = new StreamChat(apiKey, apiSecret);

// --- API Endpoints ---

/**
 * @api {get} /todos Get all todos with pagination
 * @apiName GetTodosPaginated
 * @apiGroup Todos
 * @apiParam {Number} [page=1] The page number to retrieve.
 * @apiParam {Number} [limit=10] The number of items per page.
 * @apiSuccess {Object} response The paginated list of todos and metadata.
 */
app.get('/todos', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  if (startIndex < 0 || page < 1) {
    return res.status(400).json({ error: 'Page number cannot be less than 1.' });
  }

  const paginatedTodos = todos.slice(startIndex, endIndex);
  const totalItems = todos.length;
  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    todos: paginatedTodos,
    currentPage: page,
    totalPages: totalPages,
    totalItems: totalItems,
  });
});

/**
 * @api {post} /todos Add a new todo
 * @apiName AddTodo
 * @apiGroup Todos
 * @apiParam {String} text The text content of the new todo.
 * @apiSuccess {Object} newTodo The newly created todo object with an ID.
 * @apiError (400) BadRequest If the `text` field is missing from the request body.
 */
app.post('/todos', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'The "text" field is required.' });
  }

  const newTodo = {
    id: nextId++,
    text: text,
    completed: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

/**
 * @api {delete} /todos/:id Delete a todo
 * @apiName DeleteTodo
 * @apiGroup Todos
 * @apiParam {Number} id The ID of the todo to delete.
 * @apiSuccess (200) Success The todo was successfully deleted.
 * @apiError (404) NotFound If a todo with the specified ID does not exist.
 */
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found.' });
  }

  todos.splice(todoIndex, 1);
  res.status(200).json({ message: 'Todo deleted successfully.' });
});

/**
 * @api {post} /generate-stream-token Generate a GetStream Chat access token
 * @apiName GenerateStreamToken
 * @apiGroup Auth
 * @apiParam {String} userId The unique ID of the user requesting the token.
 * @apiSuccess {String} token The GetStream Chat access token.
 * @apiError (400) BadRequest If the `userId` field is missing.
 * @apiError (500) InternalServerError If there is an error generating the token.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * { "token": "eyJhbGciOiJIUzI1NiIsIn..." }
 */
app.post('/generate-stream-token', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'The "userId" field is required.' });
  }

  try {
    // The createToken method generates a JWT for a user.
    const token = client.createToken(userId);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating Stream Chat token:', error);
    res.status(500).json({ error: 'Failed to generate token.' });
  }
});

// Start the server and listen for requests on the specified port.
app.listen(PORT, () => {
  console.log(`To-do API server is running on http://localhost:${PORT}`);
});
