import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuIcon from '@mui/icons-material/Menu';
import logo from "../../icon-192.png"

function Header() {
    return (
        <>
            <Box sx={{flexGrow: 1}}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{mr: 2}}>
                            <MenuIcon/>
                        </IconButton>
                        <img src={logo} alt="logo" style={{width: "32px", marginRight: "8px"}}/>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            FastAPI-React-Template for MUI
                        </Typography>
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>
            </Box>
        </>
    );
}

export default Header;
