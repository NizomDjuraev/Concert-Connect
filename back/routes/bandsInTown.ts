import express from "express";
import fs from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import url from "url";
import axios from "axios";
//import env from "../../env.json" assert { type: "json" };
const env = JSON.parse(fs.readFileSync('../../env.json', 'utf8'));

let apiKey = env.bandsInTownKey;

let bandsInTownRouter = express.Router();

let __dirname = url.fileURLToPath(new URL("../../..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});

bandsInTownRouter.get('/artistEvents', async (req, res) => {
    try {
        let artistName = req.query.artist;

        if (!artistName) {
            res.status(400).json({ message: 'Error, artist name missing' });
            return;
        }

        let url = `https://rest.bandsintown.com/artists/${artistName}/events?app_id=${apiKey}`;
        let response = await axios(url);
        let data = response.data;

        console.log(data[0].artist.url);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


bandsInTownRouter.get('/artistInfo', async (req, res) => {
    try {
        let artistName = "Drake";

        let url = `https://rest.bandsintown.com/artists/${artistName}/events?app_id=${apiKey}&date=2022-01-01,2022-12-31`;
        let response = await axios(url);
        let data = response.data;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

bandsInTownRouter.post('/saveEvent', async (req, res) => {
    try {
        let { spotifyID, artistName, venue, dateTime, lineup, location, latitude, longitude } = req.body;

        let checkQuery = 'SELECT * FROM SavedEvents WHERE spotifyID = ? AND artistName = ? AND dateTime = ?';
        let checkParams = [spotifyID, artistName, dateTime];
        let result = await db.get(checkQuery, checkParams);
        console.log(spotifyID);
        if (result) {
            res.status(409).json({ message: "Event already exists" });
        } else {
            let query = 'INSERT INTO SavedEvents (spotifyID, artistName, venue, dateTime, lineup, location, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            let params = [spotifyID, artistName, venue, dateTime, JSON.parse(lineup).join(', '), location, latitude, longitude];
            await db.run(query, params);

            res.status(200).json({ message: "Event saved successfully!" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving event" });
    }
});

bandsInTownRouter.post('/removeEvent', async (req, res) => {
    try {
        let { spotifyID, artistName, dateTime } = req.body;

        let query = 'DELETE FROM SavedEvents WHERE spotifyID = ? AND artistName = ? AND dateTime = ?';
        let params = [spotifyID, artistName, dateTime];
        let result = await db.run(query, params);

        res.status(200).json({ message: "Event removed successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error removing event" });
    }
});


bandsInTownRouter.get('/savedEvents', async (req, res) => {
    try {
        console.log("Saved");
        let { spotifyID } = req.query;
        console.log("req query", req.query);
        console.log("spotifyID", spotifyID);
        let query = 'SELECT * FROM SavedEvents WHERE spotifyID = ?';
        let params = [spotifyID];
        let result = await db.all(query, params);
        console.log(result);
        res.json(result);
    } catch (error) {
        console.error('Error retrieving saved events:', error);
        res.status(500).json({ error: 'Error retrieving saved events' });
    }
});

bandsInTownRouter.get('/eventTickets', async (req, res) => {
    try {
        let artistName = req.query.artist;
        let url = `https://rest.bandsintown.com/artists/${artistName}/events?app_id=${apiKey}`;
        let response = await fetch(url);
        let data = await response.json();

        let eventUrl = data[0].artist.url;

        let parsedUrl = new URL(eventUrl);
        parsedUrl.searchParams.delete('app_id');
        let cleanUrl = parsedUrl.toString();

        res.json({ link: cleanUrl });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});


export default bandsInTownRouter;