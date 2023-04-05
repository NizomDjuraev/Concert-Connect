import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

interface ArtistDataType {
  name: string;
  imageURL: string;
  artistID: string;
}

const Dashboard = () => {
  const [spotifyID, setSpotifyID] = useState("");
  const [spotifyArtistData, setSpotifyArtistData] = useState<ArtistDataType[]>(
    []
  );
  const navigate = useNavigate();

  useEffect(() => {
    const storedSpotifyID = sessionStorage.getItem("spotifyID");
    if (storedSpotifyID) {
      setSpotifyID(storedSpotifyID);
    } else {
      const params = new URLSearchParams(window.location.search);
      setSpotifyID(params.get("spotifyID") as string);
      sessionStorage.setItem("spotifyID", spotifyID);
    }

    fetch(`/spotify/topArtists/${spotifyID}`)
      .then((res) => res.json())
      .then(function (data: ArtistDataType[]) {
        setSpotifyArtistData(data);
      });
  }, [spotifyID]);

  const handleArtistCardClick = (id: string, name: string) => {
    sessionStorage.setItem("artistID", id);
    sessionStorage.setItem("artistName", name);
    navigate("/Artist");
  };

  return (
    <div>
      <Typography variant="h4" align="center" style={{ padding: "20px" }}>
        Your Top Artists
      </Typography>
      <Grid container spacing={2}>
        {spotifyArtistData.map((artist, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              onClick={() =>
                handleArtistCardClick(artist.artistID, artist.name)
              }
              sx={{
                transition: "transform 0.5s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <CardMedia
                component="img"
                image={artist.imageURL}
                title={artist.name}
              />
              <CardContent>
                <Typography variant="h6">{artist.name}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;
