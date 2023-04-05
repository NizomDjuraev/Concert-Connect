import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";

const containerStyle = {
  width: "800px",
  height: "800px",
};

interface selectedHotel {
  name: string;
  address: string;
  photo: string;
}

function MapComponent() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDYtBn9FOgfklur2ZwTPVkNPJ5j7mudC-E",
  });
  let location = useLocation();
  let center = location.state;

  const [map, setMap] = React.useState<any>(null);
  const [Hotels, setHotels] = React.useState<any[]>([]);
  const [SelectedHotel, setSelectedHotel] = React.useState<
    selectedHotel | undefined
  >(undefined);

  const onLoad = React.useCallback(async function callback(map: any) {
    const bounds = new window.google.maps.LatLngBounds(center);
    await fetch(
      `https://greekgram.christianpedro.dev/https://maps.googleapis.com/maps/api/place/textsearch/json?query=hotels&location=${center.lat},${center.lng}&radius=3000&region=us&type=hotel&key=AIzaSyDYtBn9FOgfklur2ZwTPVkNPJ5j7mudC-E`,
      {
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        let returnedArray: any[] = data.results;
        Hotels.push(returnedArray);
      })
      .catch((error) => console.log("error present"));
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map: any) {
    setMap(null);
  }, []);

  const displayHotelInfo = async (
    address: string,
    name: string,
    photo: string,
    placeId: string
  ) => {
    console.log("clicked on marker");
    setSelectedHotel({ name: name, address: address, photo: photo });
    await fetch(
      `https://greekgram.christianpedro.dev/https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,website&key=AIzaSyDYtBn9FOgfklur2ZwTPVkNPJ5j7mudC-E`,
      {
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.result);
        window.open(data.result.website, "_");
      })
      .catch((error) => console.log("couldn`t get hotel website"));
  };

  return isLoaded ? (
    <div>
      <Typography
        variant="h4"
        gutterBottom
        style={{ textAlign: "center", paddingTop: "0.5em" }}
      >
        Hotels Near Your Event
      </Typography>
      <Typography variant="body1" gutterBottom style={{ textAlign: "center" }}>
        Click on one to visit the hotel website to make reservation before your
        event!
      </Typography>
      <hr></hr>

      <div
        style={{
          justifyContent: "center",
          justifyItems: "center",
          display: "flex",
        }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={16}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Child components, such as markers, info windows, etc. */}
          {Hotels[0] !== undefined
            ? Hotels[0].map((hotel: any) => {
                return (
                  <Marker
                    key={hotel.place_id}
                    position={hotel.geometry.location}
                    onLoad={onLoad}
                    visible={true}
                    onClick={() => {
                      displayHotelInfo(
                        hotel.formatted_address,
                        hotel.name,
                        hotel.photos[0].photo_reference,
                        hotel.place_id
                      );
                    }}
                  />
                );
              })
            : null}
          <div id="hotelInfo">
            <h1>{SelectedHotel !== undefined ? SelectedHotel.name : ""}</h1>
            <h3>{SelectedHotel !== undefined ? SelectedHotel.address : ""}</h3>
            <img
              src={
                SelectedHotel !== undefined
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${SelectedHotel.photo}&key=AIzaSyDYtBn9FOgfklur2ZwTPVkNPJ5j7mudC-E`
                  : ""
              }
            ></img>
          </div>
          <></>
        </GoogleMap>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default MapComponent;
