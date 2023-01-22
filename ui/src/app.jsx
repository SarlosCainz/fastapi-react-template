import React, {useContext, useEffect, useState, useRef} from 'react';
import {createTheme, ThemeProvider} from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
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
        setInfo: setUser,
        idToken: idToken,
        setIdToken: setIdToken,
        accessToken: accessToken,
        setAccessToken: (token) => {
            setAccessToken(token);
            util.setAccessToken(token);
        },
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

            const params = new URLSearchParams();
            params.append("client_id", import.meta.env.VITE_AUTH_CLIENT_ID);
            params.append("logout_uri", import.meta.env.VITE_AUTH_LOGOUT_URL);
            window.location.href = import.meta.env.VITE_AUTH_URL + "/logout?" + params;
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

export function AppProvider({children}) {
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
    const refFirstRef = useRef(true);

    const appContext = useContext(AppContext);
    const userContext = useContext(UserContext);

    const [msg, setMsg] = useState("");
    const [isDarkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(query.matches);
        query.onchange = event => setDarkMode(event.matches);
    }, []);

    const theme = createTheme({
        palette: {
            mode: isDarkMode ? "dark" : "light",
        },
    });

    useEffect(() => {
        if (userContext.loggedIn) {
            (async () => {
                try {
                    appContext.backdrop.open();
                    const config = {
                        method: "get",
                        url: "user/me",
                    }
                    const res = await util.request(config, userContext);
                    userContext.setInfo(res.data);
                } catch (err) {
                    appContext.completed.err(err);
                } finally {
                    appContext.backdrop.close();
                }
            })();
        }
    }, [userContext.loggedIn]);

    const callback = async (code) => {
        const params = new FormData();
        params.append("code", code);
        const config = {
            method: "post",
            url: "auth/token",
            data: params,
        }
        try {
            const res = await util.request(config, userContext, false);
            const data = res.data
            const nonce = util.getNonce();
            if (data.nonce === nonce) {
                userContext.login(data.user, data.id_token, data.access_token, data.refresh_token);
                navigate("/");
            } else {
                console.log({nonce: nonce, data: data})
                alert("何か変だよ。")
            }

        } catch (err) {
            console.log(err);
            if (err.response.status === 400) {
                window.location.href = "/"
            }
        }
    };

    useEffect(() => {
        if (import.meta.env.DEV && refFirstRef.current) {
            refFirstRef.current = false;
            return;
        }

        if (!userContext.loggedIn) {
            if (location.pathname === "/login") {
                const code_match = location.search.match(/code=(?<code>[^&]+)/);
                const state_match = location.search.match(/state=(?<state>[^&]+)/);
                const error_match = location.search.match(/error=(?<code>[^&]+)/);
                if (error_match) {
                    setMsg(error_match.groups.code);
                } else if (code_match && state_match) {
                    const correctState = util.getState();
                    const state = decodeURIComponent(state_match.groups.state);
                    if (state === correctState) {
                        (callback)(code_match.groups.code);
                    } else {
                        console.log({state: state, correctState: correctState});
                        appContext.completed.set("何か変だよ?", "error");
                    }
                }
            } else if (location.pathname !== "/logout") {
                const state = util.createRandomCode();
                util.setState(state);
                const nonce = util.createRandomCode();
                util.setNonce(nonce);

                const params = new URLSearchParams();
                params.append("client_id", import.meta.env.VITE_AUTH_CLIENT_ID);
                params.append("redirect_uri", import.meta.env.VITE_AUTH_LOGIN_URL);
                params.append("response_type", "code");
                params.append("state", state);
                params.append("scope", "email openid profile");
                params.append("identity_provider", import.meta.env.VITE_AUTH_PROVIDER);
                params.append("nonce", nonce);
                window.location.href = import.meta.env.VITE_AUTH_URL + "/oauth2/authorize?" + params;
            }
        }
    }, [location]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Header/>
            <LoggedIn>
                <Body/>
            </LoggedIn>
            <NoLogin>
                {msg}
                {location.pathname === "/logout" && (
                    <>
                        <Typography>ログアウトしました。</Typography>
                        <Link href="/">Login</Link>
                    </>
                )}
            </NoLogin>
        </ThemeProvider>
    );
}

export default App;
