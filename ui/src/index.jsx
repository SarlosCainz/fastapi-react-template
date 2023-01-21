import React from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App, {AppProvider, UserProvider} from './app'

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AppProvider>
                <UserProvider>
                    <App/>
                </UserProvider>
            </AppProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
