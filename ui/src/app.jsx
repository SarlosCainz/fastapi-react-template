import React, {useContext, useState} from 'react';
import {Snackbar, Alert, Backdrop, CircularProgress} from '@mui/material';
import {Helmet} from "react-helmet";

import Login from "./components/Login";
import Header from "./components/Header";
import Body from "./components/Body";
import * as util from "./util";
import * as models from "./models";

export const AppContext = React.createContext({});
export const UserContext = React.createContext({});

export function UserProvider({children}) {
    const [accessToken, setAccessToken] = useState(util.getAccessTokeh());
    const [user, setUser] = useState(util.getUser());
    const [loggedIn, setLoggedIn] = useState(Boolean(util.getRefreshTokeh()));

    const userContext = {
        loggedIn: loggedIn,
        info: user,
        accessToken: accessToken,
        setAccessToken: setAccessToken,
        login: (user, access_token, refresh_token) => {
            setUser(user);
            setAccessToken(access_token);

            util.setUser(user);
            util.setAccessToken(access_token);
            util.setRefreshToken(refresh_token);

            if (user && access_token) {
                setLoggedIn(true);
            }
        },
        authHeader: {
            headers: {
                Authorization: "Bearer " + accessToken,
            }
        },
        logout: () => {
            console.log("logout");
            setUser(models.User);
            setAccessToken(null);
            setLoggedIn(false);
            util.setUser(null);
            util.setRefreshToken(null);
        }
    };

    return (
        <UserContext.Provider value={userContext}>
            {children}
        </UserContext.Provider>
    )
}

export function LoggedIn({children}) {
    const userContext = useContext(UserContext);

    return (
        userContext.loggedIn && (
            <>{children}</>
        )
    )
}

function AppProvider({children}) {
    const [completedInfo, setCompletedInfo] = useState({});
    const [backdropOpen, setBackdropOpen] = useState(false);
    const completed = Boolean(completedInfo.msg);
    const handleCompleted = () => setCompletedInfo({})

    const appContext = {
        completed: {
            set: (msg, severity = "success") => {
                console.log("******* " + msg + ", " + severity);
                setCompletedInfo({msg: msg, severity: severity, duration: severity === "error" ? null : 4000});
            },
            err: (err) => {
                console.log(err);
                const msg = err.response.data.detail ? err.response.data.detail : err.message;
                appContext.completed.set(msg, "error")
            },
        },
        backdrop: {
            open: () => setBackdropOpen(true),
            close: () => setBackdropOpen(false),
        },
    };

    return (
        <>
            <AppContext.Provider value={appContext}>
                {children}
            </AppContext.Provider>
            <Snackbar open={completed} autoHideDuration={completedInfo.duration}
                      message={completedInfo.msg} onClose={handleCompleted}>
                <Alert severity={completedInfo.severity}
                       onClose={handleCompleted}>{completedInfo.msg}</Alert>
            </Snackbar>
            <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1}} open={backdropOpen}>
                <CircularProgress color="inherit"/>
            </Backdrop>
        </>
    );
}

function App() {
    const userContext = useContext(UserContext);

    return (
        <AppProvider>
            <Helmet>
                <title>
                    {userContext.loggedIn ? "FastAPI-React-Template for MUI" : "login"}
                </title>
            </Helmet>
            <Header/>
            {userContext.loggedIn ? <Body/> : <Login/>}
        </AppProvider>
    );
}

export default App;
