import {useContext, useState} from "react";
import {AppBar, Avatar, Toolbar, IconButton,
        Typography, Menu, MenuItem} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {indigo} from '@mui/material/colors';

import {UserContext, LoggedIn} from "../app";
import {FooMenu} from "./Foo";
import * as util from "../util";

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

    const [anchorMenuEl, setAnchorMenuEl] = useState(null);
    const menuOpen = Boolean(anchorMenuEl);

    const handleMenuClick = (e) => setAnchorMenuEl(e.currentTarget)
    const handleMenuClose = () => setAnchorMenuEl(null)

    return (
        <>
            <AppBar>
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{mr: 1}}
                                onClick={handleMenuClick} disabled={!userContext.loggedIn}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        FastAPI-React-Template for MUI
                    </Typography>
                    <LoggedIn>
                        <UserMenu/>
                    </LoggedIn>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <LoggedIn>
                <Menu open={menuOpen} anchorEl={anchorMenuEl} onClose={handleMenuClose}>
                    <FooMenu onClose={handleMenuClose}/>
                </Menu>
            </LoggedIn>
        </>
    );
}

export default Header;
