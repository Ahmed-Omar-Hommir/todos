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
const { StreamChat } = require('stream-chat');
const apiKey = 'n6ghcfkzqn6u';
const apiSecret = 'dhk6cn5ux44n9r5ac525dfb3h537ryg8yzcafrzmnx3h6njxngpaazts25hre8ej';

// Log to confirm the client is being initialized
console.log('Initializing StreamChat client...');
const client = new StreamChat.getInstance(apiKey, apiSecret);
console.log('StreamChat client initialized.');

// --- API Endpoints ---

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
 */
app.post('/generate-stream-token', async (req, res) => {
  const { userId } = req.body;

  // Log the received request body for debugging
  console.log('Received request body:', req.body);
  console.log('Received userId:', userId);

  if (!userId) {
    return res.status(400).json({ error: 'The "userId" field is required.' });
  }

  try {
    // Log the userId right before attempting to create the token
    console.log(`Attempting to create token for userId: ${userId}`);
    const token = client.createToken(userId);
    console.log('Token created successfully.');
    res.status(200).json({ token });
  } catch (error) {
    // Log the full error object for detailed debugging
    console.error('An unexpected error occurred while generating the Stream Chat token:');
    console.error(error);
    res.status(500).json({ error: 'Failed to generate token due to a server error.' });
  }
});

// Start the server and listen for requests on the specified port.
app.listen(PORT, () => {
  console.log(`To-do API server is running on http://localhost:${PORT}`);
});