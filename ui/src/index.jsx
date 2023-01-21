import React from 'react'
import { createRoot } from 'react-dom/client';

import App, {AppProvider, UserProvider} from './app'

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <UserProvider>
            <AppProvider>
                <App/>
            </AppProvider>
        </UserProvider>
    </React.StrictMode>,
);
