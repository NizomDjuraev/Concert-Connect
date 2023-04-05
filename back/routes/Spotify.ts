import express, { Request, Response } from "express";
import request from "request";
import querystring from "querystring";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import axios from "axios";

const spotifyRouter = express.Router();

interface SpotifyAuthType {
  id: string;
}

interface SpotifyDbType {
  spotifyID: string;
  access_token: string;
  refresh_token: string;
}

interface SpotifyArtistsType {
  name: string;
  imageURL: string;
  artistID: string;
}

interface SpotifyArtistAlbumType {
  imageURL: string;
  albumName: string;
}

let __dirname = url.fileURLToPath(new URL("../../..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
  filename: dbfile,
  driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

var client_id = "bc93c832a39548c5a59f6320f995e067"; // Your client id
var client_secret = "644c5383fc4945f4a048f4f8987bf972"; // Your secret
var redirect_uri = "http://localhost:3000/spotify/callback"; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length: number) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = "spotify_auth_state";

spotifyRouter.get("/login", function (req: Request, res: Response) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = "user-read-private user-read-email user-top-read";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

spotifyRouter.get("/callback", function (req: Request, res: Response) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;

        var options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(
          options,
          async function (error, response, body: SpotifyAuthType) {
            var query: SpotifyDbType[] = [];
            try {
              query = await db.all(
                `SELECT * FROM SpotifyUsers where spotifyID = "${body.id}"`
              );
            }
            catch (err) {
              console.error(err);
              res.status(500).json({ message: "Error retrieving Spotify ID" });
            }

            try {
            if (query.length == 0) {
            
              let statement = await db.prepare(
                "INSERT INTO SpotifyUsers(spotifyID, access_token, refresh_token) VALUES (?, ?, ?)"
              );

              await statement.bind([body.id, access_token, refresh_token]);
              await statement.run();
            } else {
              let statement = await db.prepare(
                "UPDATE SpotifyUsers SET access_token = ?, refresh_token = ? WHERE spotifyID = ?"
              );
              await statement.bind([access_token, refresh_token, body.id]);
              await statement.run();
            }
          }
          catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error inserting or updating Spotify ID" });
          }

            res.redirect(
              "http://localhost:3001/Dashboard?" +
                querystring.stringify({
                  spotifyID: body.id,
                })
            );
          }
        );
      }

      // If invalid access token or some other error, redirect back to login page with error in URL query string.
      else {
        res.redirect(
          "/http://localhost:3001/?" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});

spotifyRouter.get(
  "/topArtists/:id",
  async function (req: Request, res: Response) {
    var spotifyID: string = req.params.id;
    var query: SpotifyDbType[] = [];
    try {
      query = await db.all(
        `SELECT * FROM SpotifyUsers where spotifyID = "${spotifyID}"`
      );
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error retrieving Spotify ID" });
    }
    
    if (query.length == 0) {
      return res.status(404).json( { message: "Spotify ID not found."});
    }

    var access_token: string = query[0].access_token;
    var data: SpotifyArtistsType[] = [];

    var options = {
      url: "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10&offset=0",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + access_token,
      },
      json: true,
    };

      request.get(options, async function (error, response, body) {
        if (body.error) {
          return res.status(body.error.status).json({ message: body.error.message });
        }
        
        for (var x = 0; x < body.items.length; x++) {
          var temp: SpotifyArtistsType = {
            name: body.items[x].name,
            imageURL: body.items[x].images[0].url,
            artistID: body.items[x].id,
          };

          data.push(temp);
        }

        return res.status(200).json(data);
      });
  }
);

spotifyRouter.get(
  "/topAlbums/:spotifyID/:artistID",
  async function (req: Request, res: Response) {
    var spotifyID: string = req.params.spotifyID;

    var query: SpotifyDbType[] = [];
    try {
      query = await db.all(
        `SELECT * FROM SpotifyUsers where spotifyID = "${spotifyID}"`
      );
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error retrieving Spotify ID" });
    }

    if (query.length == 0) {
      return res.status(404).json( { message: "Spotify ID not found."});
    }

    var access_token: string = query[0].access_token;
    var artistID = req.params.artistID;

    var data: SpotifyArtistAlbumType[] = [];

    var options = {
      url: `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=ES&limit=10&offset=0`,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + access_token,
      },
      json: true,
    };

    request.get(options, async function (error, response, body) {        
      if (body.error) {
        return res.status(body.error.status).json({ message: body.error.message });
      }
      
      for (var x = 0; x < body.items.length; x++) {
        var temp: SpotifyArtistAlbumType = {
          imageURL: body.items[x].images[0].url,
          albumName: body.items[x].name,
        };

        // checking if albumName already exists, some artists had duplicate names.
        var albumExists = data.some(function (item) {
          return item.albumName === temp.albumName;
        });

        if (!albumExists) {
          data.push(temp);
        }
      }

      //Only returning 3 albums so that Arist page is just one row of 3 album pictures.
      return res.status(200).json(data.slice(0, 3));
    });
  }
);

spotifyRouter.get("/refresh_token", function (req: Request, res: Response) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    //    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    headers: { Authorization: "Basic ", client_id: client_secret },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

export default spotifyRouter;