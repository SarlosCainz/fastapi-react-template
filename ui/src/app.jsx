import React, {useEffect, useState} from 'react';

import Header from "./components/Header";
import Body from "./components/Body";
import axios from "axios";

export const AppContext = React.createContext();

function App() {
    const api_url = import.meta.env.VITE_API_URL;
    const appContext = {
        api_url: api_url
    };

    return (
        <AppContext.Provider value={appContext}>
            <Header/>
            <Body/>
        </AppContext.Provider>
    );
}

export default App;
