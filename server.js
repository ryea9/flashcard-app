require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_FOLDER = path.join(__dirname, 'public');

const LIMITS = {
  title: 100,
  description: 300,
  question: 200,
  answer: 500
};

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '20kb' }));
app.use(express.static(PUBLIC_FOLDER));

function sendError(res, status, message) {
  return res.status(status).json({ message });
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseId(rawId) {
  const parsedId = Number.parseInt(rawId, 10);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
}

function validateLength(value, maxLength, fieldName, required = false) {
  if (required && !value) {
    throw new Error(`${fieldName} is required`);
  }

  if (value.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer`);
  }
}

function validateSetPayload(body) {
  const title = cleanText(body.title);
  const description = cleanText(body.description);

  validateLength(title, LIMITS.title, 'Title');
  validateLength(description, LIMITS.description, 'Description');

  return { title, description };
}

function validateFlashcardPayload(body) {
  const question = cleanText(body.question);
  const answer = cleanText(body.answer);

  validateLength(question, LIMITS.question, 'Term', true);
  validateLength(answer, LIMITS.answer, 'Definition', true);

  return { question, answer };
}

function isValidationError(message) {
  return message.includes('required') || message.includes('characters or fewer');
}

app.get('/api/set', async (req, res, next) => {
  try {
    const rows = await db.query('SELECT id, title, description FROM flashcard_set WHERE id = ?', [1]);
    res.json(rows[0] || { id: 1, title: '', description: '' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/set', async (req, res, next) => {
  try {
    const { title, description } = validateSetPayload(req.body);

    await db.execute('UPDATE flashcard_set SET title = ?, description = ? WHERE id = ?', [
      title,
      description,
      1
    ]);

    res.json({ message: 'Set details saved successfully' });
  } catch (error) {
    if (isValidationError(error.message)) {
      return sendError(res, 400, error.message);
    }

    next(error);
  }
});

app.get('/api/flashcards', async (req, res, next) => {
  try {
    const rows = await db.query('SELECT id, question, answer FROM flashcards ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/flashcards', async (req, res, next) => {
  try {
    const { question, answer } = validateFlashcardPayload(req.body);
    const [result] = await db.execute('INSERT INTO flashcards (question, answer) VALUES (?, ?)', [
      question,
      answer
    ]);

    res.status(201).json({
      message: 'Flashcard added successfully',
      id: result.insertId
    });
  } catch (error) {
    if (isValidationError(error.message)) {
      return sendError(res, 400, error.message);
    }

    next(error);
  }
});

app.put('/api/flashcards/:id', async (req, res, next) => {
  const id = parseId(req.params.id);

  if (!id) {
    return sendError(res, 400, 'Invalid flashcard id');
  }

  try {
    const { question, answer } = validateFlashcardPayload(req.body);
    const [result] = await db.execute('UPDATE flashcards SET question = ?, answer = ? WHERE id = ?', [
      question,
      answer,
      id
    ]);

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Flashcard not found');
    }

    res.json({ message: 'Flashcard updated successfully' });
  } catch (error) {
    if (isValidationError(error.message)) {
      return sendError(res, 400, error.message);
    }

    next(error);
  }
});

app.delete('/api/flashcards/:id', async (req, res, next) => {
  const id = parseId(req.params.id);

  if (!id) {
    return sendError(res, 400, 'Invalid flashcard id');
  }

  try {
    const [result] = await db.execute('DELETE FROM flashcards WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Flashcard not found');
    }

    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    next(error);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_FOLDER, 'index.html'));
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return sendError(res, 400, 'Invalid JSON in request body');
  }

  console.error('Server error:', error.message);
  return sendError(res, 500, 'Something went wrong on the server');
});

async function startServer() {
  try {
    await db.initialiseDatabase();
    console.log('Connected to MySQL');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database initialisation failed:', error.message);
    console.error('Check that MySQL is running and that your .env values are correct.');
    process.exit(1);
  }
}

startServer();
