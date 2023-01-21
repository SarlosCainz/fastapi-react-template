import React, {useContext, useEffect, useState, useRef} from 'react';
import {Snackbar, Alert, Dialog, DialogTitle, Typography, DialogContent} from '@mui/material';

import Header from "./components/Header";
import Body from "./components/Body";
import * as util from "./util";
import * as models from "./models";

export const AppContext = React.createContext();
export const UserContext = React.createContext();

export function SimpleDialog({open, onClose, title, children}) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle><Typography>{title}</Typography></DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
        </Dialog>
    )
}

export function UserProvider({children}) {
    const [accessToken, setAccessToken] = useState(util.getAccessToken());
    const [user, setUser] = useState(models.User);
    const [loggedIn, setLoggedIn] = useState(Boolean(util.getRefreshToken()));

    const userContext = {
        loggedIn: loggedIn,
        userInfo: user,
        setUser: userInfo => setUser(userInfo),
        accessToken: accessToken,
        setAccessToken: setAccessToken,
        login: (username, access_token, refresh_token) => {
            setAccessToken(access_token);

            util.setAccessToken(access_token);
            util.setRefreshToken(refresh_token);
            util.setUsername(username);

            setLoggedIn(true);
        },
        logout: () => {
            console.log("logout");
            setUser(models.User);
            setAccessToken(null);
            setLoggedIn(false);
            util.setRefreshToken(null);
            util.setUsername(null);
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

export function AppProvider({children}) {
    const [completedInfo, setCompletedInfo] = useState({});
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
        </>
    );
}

function App() {
    const appContext = useContext(AppContext);
    const userContext = useContext(UserContext);

    const refFirstRef = useRef(true);

    useEffect(() => {
        // Strictモードの開発サーバでuseEffectが2回呼ばれるのを防ぐ。
        if (import.meta.env.DEV && refFirstRef.current) {
            refFirstRef.current = false;
            return;
        }

        if (userContext.loggedIn) {
            (async () => {
                const config = {
                    method: "get",
                    url: "user/me",
                }
                try {
                    const res = await util.request(config, userContext);
                    console.log(res);
                    userContext.setUser(res.data);
                } catch (err) {
                    appContext.err(err);
                }
            })();
        }

    }, [userContext.loggedIn]);

    return (
        <>
            <Header/>
            <LoggedIn>
                <Body/>
            </LoggedIn>
        </>
    );
}

export default App;
