import {useContext, useState} from "react";
import {AppBar, Avatar, Toolbar, IconButton,
        Typography, Button, Menu, MenuItem,
        Dialog, DialogContent} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {indigo} from '@mui/material/colors';

import {UserContext} from "../app";
import Login from "./Login";
import * as util from "../util";

function LoginButton() {
    const [open, setOpen] = useState(false);

    const handleClickLogin = () => setOpen(true)
    const handleClose = () => setOpen(false);

    return (
        <>
            <Button color="inherit" onClick={handleClickLogin}>Login</Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <Login/>
                </DialogContent>
            </Dialog>
        </>
    );
}

function UserMenu() {
    const userContext = useContext(UserContext);
    const [anchorProfileMenuEl, setAnchorProfileMenuEl] = useState(null);
    const profileMenuOpen = Boolean(anchorProfileMenuEl);

    const handleClickAvatar = (e) => setAnchorProfileMenuEl(e.currentTarget);
    const handleMenuClose = () => setAnchorProfileMenuEl(null);
    const doLogout = () => {
        handleMenuClose();
        userContext.logout();
    }

    return (
        <>
            <Avatar onClick={handleClickAvatar}
                    sx={{m: 2, bgcolor: indigo[600], width: 35, height: 35}}>
                <Typography>{util.initial(userContext.info.full_name)}</Typography>
            </Avatar>
            <Menu id="user-menu" anchorEl={anchorProfileMenuEl} open={profileMenuOpen} onClose={handleMenuClose}>
                <MenuItem>{userContext.info.full_name}</MenuItem>
                <MenuItem onClick={doLogout}>Logout</MenuItem>
            </Menu>
        </>
    );
}
function Header() {
    const userContext = useContext(UserContext);

    return (
        <>
            <AppBar>
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{mr: 1}}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        FastAPI-React-Template for MUI
                    </Typography>
                    {userContext.loggedIn ? <UserMenu/> : <LoginButton/>}
                </Toolbar>
            </AppBar>
            <Toolbar/>
        </>
    );
}

export default Header;
