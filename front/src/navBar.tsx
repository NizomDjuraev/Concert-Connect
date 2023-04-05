import { Link } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

let NavBar = () => {

    return (
        <AppBar position="static" color="default" style={{ backgroundColor: 'green' }}>
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1, color: 'white' }}>
                Concert Connect
                </Typography>
                <Link to="/Dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="secondary" style={{ backgroundColor: 'green', color: 'white' }}>Top Artists</Button>
                </Link>
                <Link to="/SavedEvents" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="secondary" style={{ backgroundColor: 'green', color: 'white' }}>Saved Events</Button>
                </Link>
                <Link to="/SearchEvents" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="secondary" style={{ backgroundColor: 'green', color: 'white' }}>Search Events</Button>
                </Link>
            </Toolbar>
    </AppBar>
  );
};

export default NavBar;
