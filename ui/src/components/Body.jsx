import { Routes, Route } from 'react-router-dom';
import {Container, Typography} from "@mui/material"

import Main from "./Main";
import Foo from "./Foo";

function Body() {
    return (
        <Container sx={{mt: 1}}>
            <Routes>
                <Route path="/" element={<Main/>} />
                <Route path="/foo" element={<Foo/>} />
            </Routes>
        </Container>
    );
}

export default Body;
