// Primeiro criar o banco de dados SQLite 

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');