import express from 'express';
import pool from './data/db.js';

const app = express();
const PORT  = 3000;

app.get('/eloadok', async (req, res) => {    
    const orszag = req.query.orszag;
    
    if(!orszag){
        let sql = 'SELECT * FROM `eloadok` ORDER BY nev;';
        let eredmeny = await pool.query(sql);
        res.json(eredmeny);
    }
    else{
        let sql = 'SELECT * FROM `eloadok` WHERE orszag = ? ORDER BY nev;';
        let eredmeny = await pool.query(sql, orszag);
        res.json(eredmeny);
    }
});

app.get('/eloadok/:id', async (req, res) => {
    const id = req.params.id;
    
    if(!Number(id)){
        res.status(400).send("Hiba: A megadott érték nem szám!");
    }

    let sql = 'SELECT * FROM `eloadok` WHERE id = ?;';
    let eredmeny = await pool.query(sql, id);

    res.json(eredmeny);
});

app.get('/albumok', async (req, res) => {
    const {mufaj, tol, ig} = req.query;
    if(!mufaj || !tol || !ig)
    {
        let sql = 'SELECT eloadok.id, albumok.cim, eloadok.nev, albumok.ev, albumok.mufaj, albumok.hossz FROM `eloadok` INNER JOIN albumok ON albumok.eloado_id = eloadok.id ORDER BY albumok.ev ASC, albumok.cim ASC;';
        let eredmeny = await pool.query(sql);
        res.json(eredmeny);
    }
    if(mufaj || !tol || !ig){
        let sql = `SELECT eloadok.id, albumok.cim, eloadok.nev, albumok.ev, albumok.mufaj, albumok.hossz FROM eloadok INNER JOIN albumok ON albumok.eloado_id = eloadok.id WHERE mufaj = ? ORDER BY albumok.ev ASC, albumok.cim ASC;`;
        let eredmeny = await pool.query(sql, mufaj);
        res.json(eredmeny);
    }
});


app.get('/albumok/kereses', async (req, res) => {
    const {q} = req.query;

    if(q.length < 2){
        res.status(400).send("Legalább kettő karaktert kell megadni!");
    }

    let sql = `SELECT albumok.cim, eloadok.nev FROM eloadok INNER JOIN albumok ON albumok.eloado_id = eloadok.id WHERE eloadok.nev LIKE '%${q}%' OR albumok.cim LIKE '%${q}%';`;
    let eredmeny = await pool.query(sql);
    res.json(eredmeny);
});


app.get('/mufajok', async (req, res) =>{
    let sql = 'SELECT mufaj, COUNT(albumok.mufaj) AS "albumDb", SUM(albumok.hossz) AS "osszHossz" FROM eloadok INNER JOIN albumok ON albumok.eloado_id = eloadok.id GROUP BY mufaj;';
    let eredmeny = await pool.query(sql);
    res.json(eredmeny);
});

app.get('/statisztika/eloadok', async (req, res) => {
    let sql = 'SELECT eloadok.nev, COUNT(albumok.cim) AS albumDb, MIN(albumok.ev) AS elso, MAX(albumok.ev) AS utolso FROM eloadok LEFT JOIN albumok ON eloadok.id = albumok.eloado_id GROUP BY eloadok.nev;';
    let eredmeny = await pool.query(sql);
    res.json(eredmeny);
});

app.get('/orszagok', async (req, res) => {
    let sql = 'SELECT eloadok.orszag AS orszag, COUNT(eloadok.nev) AS eloadoDb, COUNT(albumok.cim) AS albumDb FROM eloadok INNER JOIN albumok ON albumok.eloado_id = eloadok.id GROUP BY eloadok.orszag;';
    let eredmeny = await pool.query(sql);
    res.json(eredmeny);
});


app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${3000}`);
});