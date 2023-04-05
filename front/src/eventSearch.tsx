import { style } from "@mui/system";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";

let spotifyID = sessionStorage.getItem("spotifyID");

interface Event {
    artist: {
        image_url: string;
    };
    venue: {
        name: string;
        location: string;
        latitude: number;
        longitude: number;
    };
    datetime: string;
    lineup: string[];
    artistName: string;
}

let EventSearch: React.FC = () => {
    let [searchTerm, setSearchTerm] = useState<string>("");
    let [eventData, setEventData] = useState<Event[]>([]);
    let [searchResults, setMessage] = useState(false);

    let navigate = useNavigate();

    let handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    let handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            let response = await fetch(`/bands/artistEvents?artist=${searchTerm}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(response);
            if (response.status == 200) {
                let data: Event[] = await response.json();
                let eventDataWithArtistName = data.map((event) => ({
                    ...event,
                    artistName: searchTerm,
                    datetime: new Date(event.datetime).toLocaleString(),

                }));
                console.log("eventData", eventDataWithArtistName);
                setEventData(eventDataWithArtistName);
                setMessage(false);
            } else {
                setMessage(true);
            }
        } catch (error) {
            setMessage(true);
            console.error(error);
        }
    };

    let handleViewEvent = (eventIndex: number) => {
        console.log(eventData[0]);
        navigate("/viewEvent", { state: eventData[eventIndex] });
    };


    return (
        <Box className="content">
            <Typography variant="h4" gutterBottom sx={{ marginLeft: "10px" }}>
                Search Upcoming Events
            </Typography>
            <form onSubmit={handleSearchSubmit}>
                <FormControl sx={{ marginLeft: "10px" }}>
                    <TextField
                        id="artist-name"
                        label="Artist Name"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </FormControl>
                <FormControl sx={{ marginTop: "10px" }}>
                    <Button
                        variant="contained"
                        type="submit"
                        style={{ backgroundColor: 'green', color: 'white' }}
                    >
                        Search
                    </Button>
                </FormControl>
            </form>
            {searchResults && (
                <Typography variant="body1" sx={{ marginTop: "10px", color: "maroon" }}>
                    Not found
                </Typography>
            )}
            {eventData && eventData.length > 0 && (
                <>
                    {eventData[0].artist && eventData[0].artist.image_url && (
                        <img
                            src={eventData[0].artist.image_url}
                            alt="Event"
                            style={{
                                width: "300px",
                                display: "block",
                                marginLeft: "auto",
                                marginRight: "auto",
                                paddingBottom: "1em",
                            }}
                        />
                    )}
                    {eventData.map((event, index) => (
                        <Box
                            key={index}
                            sx={{
                                border: "1px solid black",
                                padding: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <Typography variant="body1">
                                <strong>Venue: </strong>
                                {event.venue.name}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Date: </strong>
                                {event.datetime}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Lineup: </strong>
                                {event.lineup.slice(0, 5).join(", ")}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Location: </strong>
                                {event.venue.location}
                            </Typography>
                            <Button
                                onClick={() => handleViewEvent(index)}
                                variant="contained"
                                style={{ backgroundColor: 'green', color: 'white' }}
                            >
                                View Event
                            </Button>
                        </Box>
                    ))}
                </>
            )}
        </Box>
    );
};

export default EventSearch;
