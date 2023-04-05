import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

let spotifyID = sessionStorage.getItem('spotifyID');

function ViewEvent() {
  let location = useLocation();
  let eventData = location.state;
  let navigate = useNavigate();
  let latitude = Number(parseFloat(eventData.venue.latitude).toFixed(4));
  let longitude = Number(parseFloat(eventData.venue.longitude).toFixed(4));
  let [eventExists, setEventExists] = useState(false);
  let [savedMessage, setSavedMessage] = useState(false);
  let [messageSent, setMessageSent] = useState(false);
  let [notificationMethod, setNotificationMethod] = useState<string>("email");
  let [contactInfo, setContactInfo] = useState<string>("");

  let handleSaveEvent = async () => {
    try {
      let eventFields = {
        spotifyID: spotifyID,
        artistName: eventData.artistName,
        venue: eventData.venue.name,
        dateTime: eventData.datetime,
        lineup: JSON.stringify(eventData.lineup),
        location: eventData.venue.location,
        latitude: latitude,
        longitude: longitude
      };

      let response = await fetch('/bands/saveEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventFields)
      });

      if (response.status === 200) {
        console.log("Event saved successfully!");
        setEventExists(false);
        setSavedMessage(true);
      } else if (response.status === 409) {
        console.log("Event already exists");
        setEventExists(true);
        setSavedMessage(false);
      } else {
        console.error("Error saving event");
        setEventExists(false);
        setSavedMessage(false);
      }

    } catch (error) {
      console.error(error);
    }
  };


  let handleMapRedirect = () => {
    console.log(eventData.venue)
    let eventCoordinates = { lat: latitude, lng: longitude }
    navigate('/viewMap', { state: eventCoordinates });
  };

  let handleMethodChange = (event: SelectChangeEvent) => {
    setNotificationMethod(event.target.value as string);
  };

  let handleContactChange = (contact: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(contact.target.value);
  };


  let getTicketmasterLink = async (artist: string, city: string) => {
    let res = await fetch(`/ticketmaster/eventTickets?artist=${artist}&city=${city}`);
    let data = await res.json();
    return data.link;
  };

  let getBandsLink = async (artist: string) => {
    let res = await fetch(`/bands/eventTickets?artist=${artist}`);
    let data = await res.json();
    return data.link;
  };

  let sendTwilioMessage = async (
    notificationMethod: string,
    contactInfo: string,
    name: string,
    date: string,
    lineup: string,
    location: string,
    linkToTickets: string
  ) => {
    let response = await fetch("/twilio/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationMethod,
        contactInfo,
        name,
        date,
        lineup,
        location,
        linkToTickets,
      }),
    });

    let data = await response.json();
    return data;
  };

  let handleTicketmasterRedirect = async () => {
    let splitLocation = eventData.venue.location.split(",");
    let city = splitLocation[0];
    let artist = eventData.artistName;

    try {
      let linkToTickets = await getTicketmasterLink(artist, city);

      if (!linkToTickets) {
        linkToTickets = await getBandsLink(artist);
      }

      window.open(linkToTickets, "_blank");
    } catch (error) {
      console.error(error);
    }
  };

  let handleInvite = async (form: React.FormEvent<HTMLFormElement>) => {
    form.preventDefault();

    let splitLocation = eventData.venue.location.split(",");
    let city = splitLocation[0];
    let artist = eventData.artistName;

    try {
      let linkToTickets = await getTicketmasterLink(artist, city);

      if (!linkToTickets) {
        linkToTickets = await getBandsLink(artist);
      }

      let data = await sendTwilioMessage(
        notificationMethod,
        contactInfo,
        eventData.venue.name,
        eventData.datetime,
        eventData.lineup,
        eventData.venue.location,
        linkToTickets
      );

      setMessageSent(true);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Event Details for {eventData.artistName}'s Concert
      </Typography>

      <Box
        component="div"
        sx={{
          border: '1px solid black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <Box
          component="div"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {eventData.venue.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Date: </strong>
            {eventData.datetime}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Lineup: </strong>
            {eventData.lineup.split(", ").slice(0, 5).join(", ")}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Location: </strong>
            {eventData.venue.location}
          </Typography>
          <Button onClick={handleSaveEvent} variant="contained" color="secondary" style={{ backgroundColor: 'green', color: 'white' }}>
            Save Event
          </Button>
          {eventExists && (
            <Typography
              variant="body1"
              style={{ marginTop: '10px', color: 'red' }}
            >
              Event already exists
            </Typography>
          )}
          {savedMessage && (
            <Typography
              variant="body1"
              style={{ marginTop: '10px', color: 'green' }}
            >
              Event saved!
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        component="form"
        sx={{
          border: '1px solid black',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}
        onSubmit={handleInvite}
      >
        <Typography variant="h6" gutterBottom>
          Invite Your Friends
        </Typography>

        <Box component="div" sx={{ display: 'flex', alignItems: 'baseline', marginLeft: '50px', marginBottom: '10px' }}>
          <InputLabel htmlFor="notification-method">Share via</InputLabel>
          <FormControl sx={{ marginLeft: '10px' }}>
            <Select
              id="notification-method"
              name="notification-method"
              value={notificationMethod}
              onChange={handleMethodChange}
              sx={{ minWidth: '200px' }}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box component="div" sx={{ display: 'flex', alignItems: 'baseline', marginLeft: '10px', marginBottom: '10px' }}>
          <InputLabel htmlFor="contact-info">
            {notificationMethod === 'email' ? 'Email Address' : 'Phone Number'}
          </InputLabel>
          <TextField
            id="contact-info"
            name="contact-info"
            value={contactInfo}
            onChange={handleContactChange}
            placeholder={notificationMethod === 'email' ? 'example@example.com' : '123-456-7890'}
            sx={{ marginLeft: '10px', minWidth: '200px' }}
          />
        </Box>

        <Box component="div" sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <Button type="submit" variant="contained" color="secondary" style={{ backgroundColor: 'green', color: 'white' }}>
            Send
          </Button>

        </Box>
        {messageSent && (
          <Typography
            variant="body1"
            style={{ marginTop: '10px' }}
          >
            Invite Shared
          </Typography>
        )}
      </Box>

      <Box component="div" sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Box component="div" sx={{ border: '1px solid black', padding: '20px', marginRight: '10px', width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Ticketmaster Redirect
          </Typography>
          <Button onClick={handleTicketmasterRedirect} variant="contained" color="secondary" style={{ backgroundColor: 'green', color: 'white' }}>
            Buy Tickets
          </Button>
        </Box>

        <Box component="div" sx={{ border: '1px solid black', padding: '20px', width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Map Redirect
          </Typography>
          <Button onClick={handleMapRedirect} variant="contained" color="secondary" style={{ backgroundColor: 'green', color: 'white' }}>
            Map
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ViewEvent;