import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import '@fontsource/roboto/300.css';

const Login = () => {
  
  const handleClick = () => {
    window.location.href = "/spotify/login";
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        padding="50px"
        border="2px solid black"
      >
        <Button onClick={handleClick} variant="contained" style={{ backgroundColor: 'green', color: 'white' }}>
          Login with Spotify
        </Button>
      </Box>
    </Box>
  );
};

export default Login;