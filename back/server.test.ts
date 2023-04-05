import axios, { AxiosError } from "axios";

let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;

test("/spotify/topArtists/:id valid id but no token returns 400 status", async () => {
    var spotifyID = "test_12345";
    
    try {
        await axios.get(`${baseUrl}/spotify/topArtists/${spotifyID}`);
    } catch (error) {
        let errorObj = error as AxiosError;

        if (errorObj.response === undefined) {
            throw errorObj;
        }

        let { response } = errorObj;

        expect(response.status).toEqual(400);
    }
});

test("/spotify/topArtists/:id invalid id returns 404 status", async () => {
    var spotifyID = "this id doesn't exist in SpotifyUsers";
    
    try {
        await axios.get(`${baseUrl}/spotify/topArtists/${spotifyID}`);
    } catch (error) {
        let errorObj = error as AxiosError;

        if (errorObj.response === undefined) {
            throw errorObj;
        }

        let { response } = errorObj;

        expect(response.status).toEqual(404);
    }
});

test("/topAlbums/:spotifyID/:artistID valid spotifyID but no token returns 400 status", async () => {
    var spotifyID = "test_12345";
    var artistID = "12345abcdef";
    
    try {
        await axios.get(`${baseUrl}/spotify/topAlbums/${spotifyID}/${artistID}`);
    } catch (error) {
        let errorObj = error as AxiosError;

        if (errorObj.response === undefined) {
            throw errorObj;
        }

        let { response } = errorObj;

        expect(response.status).toEqual(400);
    }
});

test("/topAlbums/:spotifyID/:artistID invalid id returns 404 status", async () => {
    var spotifyID = "this id doesn't exist in SpotifyUsers";
    var artistID = "12345abcdef";
    
    try {
        await axios.get(`${baseUrl}/spotify/topAlbums/${spotifyID}/${artistID}`);
    } catch (error) {
        let errorObj = error as AxiosError;

        if (errorObj.response === undefined) {
            throw errorObj;
        }

        let { response } = errorObj;

        expect(response.status).toEqual(404);
    }
});