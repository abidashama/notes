const express = require('express');
const app = express(); 
const { pool } = require('./dbConfig');
const session = require('express-session');
const flash = require('express-flash');

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use(express.static(__dirname + '/public'));

app.get('/index', async(req, res) => {

    pool.query('SELECT * FROM notes',
    (err, results) => {
        if(err){
            throw err;
        }
        console.log(results.rows);
        res.render('index', { results: results.rows });
    } 
    );
});

app.get('/notes/:id', (req, res) => {
    const {id} = req.params;
    pool.query(
        'SELECT * FROM notes WHERE id=$1',
        [id],
        (err, results) => {
            if(err){
                throw err;
            }
            console.log(results.rows);
            res.render('notes', { results: results.rows });
        }
    );

});

app.post('/index', (req, res) =>{
    let { title, note } = req.body;

    pool.query( 
        'INSERT INTO notes (title, note) VALUES ($1, $2) RETURNING id, title, note', 
        [title, note],
        (err, results) => {
            if(err){
                throw err;
            }
            console.log(results.rows);
        }
    );

});

app.post('/notes/:id', (req, res) => {
    let { id } = req.params;
    let { title, note } = req.body;

    pool.query(
        'UPDATE notes SET title=$1, note=$2 WHERE id=$3', 
        [title, note, id],
        (err, results) => {
            if(err){
                throw err;
            }
            console.log('reaches here');
            console.log(results.rows);
            res.render('notes', { results: results.rows });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});