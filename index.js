const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {    
    res.send('👋🏿🌍');
});

app.get('/questions', async (req, res) => {
    try {
        const allQuestions = await pool.query("SELECT * FROM questions");
        res.json(allQuestions.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const question = await pool.query("SELECT * FROM questions WHERE id = $1", [id]);
        if (question.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
})

app.get('/search', async (req, res) => {
    const searchTerm = req.query.term;
    const client = await pool.connect();
    const result = await client.query(
        `SELECT * FROM questions WHERE question LIKE '%${searchTerm}%' ORDER BY question ASC`
    );
    client.release();
    res.send(result.rows);
});

app.put('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { number, question, answer, options } = req.body;
        const updateQuestion = await pool.query("UPDATE questions SET number = $1, question = $2, answer = $3, options = $4 WHERE id = $5", [number, question, answer, options, id]);
        res.json("Question was updated!");
    } catch (err) {
        console.error(err.message);
    }
})

app.post('/questions', async (req, res) => {
    try {
        const { id, number, question, answer, options } = req.body;
        const newQuestion = await pool.query("INSERT INTO questions (id, number, question, answer, options) VALUES($1, $2, $3, $4, $5) RETURNING *", [id, number, question, answer, options]);
        res.json(newQuestion.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
})


app.delete('/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuestion = await pool.query("DELETE FROM questions WHERE id = $1", [id]);
        res.json("Question successfully deleted!");
    } catch (err) {
        console.error(err.message);
    }
})



app.listen(5000, () => {
    console.log('Server has started on port 5000');
})