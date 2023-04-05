CREATE TABLE SpotifyUsers (
    id INTEGER PRIMARY KEY,
    spotifyID TEXT,
    access_token TEXT,
    refresh_token TEXT
);

CREATE TABLE SavedEvents (
    spotifyID TEXT,
    artistName TEXT,
    venue TEXT,
    dateTime dateTime,
    lineup TEXT,
    location TEXT,
    latitude Float,
    longitude Float
);