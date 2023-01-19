import React, {useContext, useEffect, useState, useRef} from 'react';
import {useNavigate, useLocation, Navigate, Routes, Route} from "react-router-dom";
import {Snackbar, Alert, Backdrop, CircularProgress, Typography, Link} from '@mui/material';
import {Helmet} from "react-helmet";

import Header from "./components/Header";
import Body from "./components/Body";
import * as util from "./util";
import * as models from "./models";

export const AppContext = React.createContext({});
export const UserContext = React.createContext({});

export function UserProvider({children}) {
    const [idToken, setIdToken] = useState(util.getIdTokeh());
    const [accessToken, setAccessToken] = useState(util.getAccessTokeh());
    const [user, setUser] = useState(util.getUser());
    const [loggedIn, setLoggedIn] = useState(Boolean(accessToken));

    const userContext = {
        loggedIn: loggedIn,
        info: user,
        idToken: idToken,
        setIdToken: setIdToken,
        accessToken: accessToken,
        setAccessToken: setAccessToken,
        login: (user, id_token, access_token, refresh_token) => {
            setUser(user);
            setAccessToken(access_token);
            setLoggedIn(true);

            util.setUser(user);
            util.setIdToken(id_token);
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
            setIdToken(null);
            setAccessToken(null);
            setLoggedIn(false);
            util.setUser(null);
            util.setAccessToken(null);
            util.setRefreshToken(null);

            window.location.href = import.meta.env.VITE_API_URL + "auth/logout";
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

export function NoLogin({children}) {
    const userContext = useContext(UserContext);

    return (
        !userContext.loggedIn && (
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
    console.log("App");
    const refFirstRef = useRef(true);
    const userContext = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    console.log({location: location});

    useEffect(() => {
        if (import.meta.env.DEV && refFirstRef.current) {
            refFirstRef.current = false;
            return;
        }
        console.log(location);
        if (location.pathname === "/login") {
            const code_match = location.search.match(/code=(?<code>[^&]+)/);
            const error_match = location.search.match(/error=(?<code>[^&]+)/);
            if (code_match) {
                (async () => {
                    const params = new FormData();
                    params.append("code", code_match.groups.code);
                    const config = {
                        method: "post",
                        url: "auth/callback",
                        data: params,
                    }
                    try {
                        const res = await util.request(config, userContext, false);
                        const data = res.data
                        userContext.login(data.user, data.id_token, data.access_token, data.refresh_token);
                        navigate("/");
                    } catch (err) {
                        console.log(err);
                        if (err.response.status === 400) {
                            window.location.href = "/"
                        }
                    }
                })();
            }
        } else if (location.pathname !== "/logout") {
            if (!userContext.loggedIn) {
                window.location.href = import.meta.env.VITE_API_URL + "auth/login";
            }
        }
    }, [location]);

    return (
        <AppProvider>
            <Header/>
            <LoggedIn>
                <Body/>
            </LoggedIn>
            <NoLogin>
                {location.pathname === "/logout" && (
                    <>
                        <Typography>ログアウトしました。</Typography>
                        <Link href="/">Login</Link>
                    </>
                )}
            </NoLogin>
        </AppProvider>
    );
}

export default App;
