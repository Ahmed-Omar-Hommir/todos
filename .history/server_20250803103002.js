// A simple Node.js and Express server for a to-do list API.

const express = require('express');
const app = express();
const PORT = 3000;

// Enable CORS for a basic API. This allows a front-end app on a different origin to make requests.
// In a real-world scenario, you might want to configure this more restrictively.
const cors = require('cors');
app.use(cors());

// Middleware to parse JSON bodies from incoming requests.
app.use(express.json());

// --- In-memory data store for the to-do list ---
let todos = [
  { id: 1, text: 'Prepare for the interview', completed: false },
  { id: 2, text: 'Review Node.js and Express', completed: true },
  { id: 3, text: 'Create a simple app', completed: false },
];
let nextId = 4; // To generate unique IDs for new todos.

// --- API Endpoints ---

/**
 * @api {get} /todos Get all todos
 * @apiName GetTodos
 * @apiGroup Todos
 * @apiSuccess {Object[]} todos List of all todos.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
 * { "id": 1, "text": "Prepare for the interview", "completed": false },
 * { "id": 2, "text": "Review Node.js and Express", "completed": true }
 * ]
 */
app.get('/todos', (req, res) => {
  // Send the list of todos as a JSON response with a 200 OK status.
  res.status(200).json(todos);
});

/**
 * @api {post} /todos Add a new todo
 * @apiName AddTodo
 * @apiGroup Todos
 * @apiParam {String} text The text content of the new todo.
 * @apiSuccess {Object} newTodo The newly created todo object with an ID.
 * @apiError (400) BadRequest If the `text` field is missing from the request body.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 201 Created
 * { "id": 4, "text": "New todo item", "completed": false }
 */
app.post('/todos', (req, res) => {
  const { text } = req.body;

  // Basic validation: ensure a 'text' field is provided.
  if (!text) {
    return res.status(400).json({ error: 'The "text" field is required.' });
  }

  const newTodo = {
    id: nextId++,
    text: text,
    completed: false, // New todos are always not completed.
  };

  todos.push(newTodo);
  // Respond with the newly created todo and a 201 Created status.
  res.status(201).json(newTodo);
});

/**
 * @api {delete} /todos/:id Delete a todo
 * @apiName DeleteTodo
 * @apiGroup Todos
 * @apiParam {Number} id The ID of the todo to delete.
 * @apiSuccess (200) Success The todo was successfully deleted.
 * @apiError (404) NotFound If a todo with the specified ID does not exist.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * { "message": "Todo deleted successfully." }
 */
app.delete('/todos/:id', (req, res) => {
  // Get the ID from the URL parameters and convert it to a number.
  const id = parseInt(req.params.id);

  // Find the index of the todo to be deleted.
  const todoIndex = todos.findIndex(todo => todo.id === id);

  // Check if the todo exists.
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found.' });
  }

  // Remove the todo from the array.
  todos.splice(todoIndex, 1);

  // Respond with a success message and a 200 OK status.
  res.status(200).json({ message: 'Todo deleted successfully.' });
});

// Start the server and listen for requests on the specified port.
app.listen(PORT, () => {
  console.log(`To-do API server is running on http://localhost:${PORT}`);
});
