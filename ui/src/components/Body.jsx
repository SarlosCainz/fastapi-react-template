import {useContext, useEffect, useState} from "react";
import {Container, Typography} from "@mui/material"
import axios from "axios";

import {AppContext} from "../app";


function Body() {
    const appContext = useContext(AppContext);
    const [data, setData] = useState("");

    useEffect(() => {
        axios.get(appContext.api_url + "hello")
            .then( res => {
                if (res.status === 200) {
                    setData(res.data.message);
                }
            })
            .catch( err => {
                alert(err);
            });
    }, []);

    return (
        <Container sx={{mt: 1}}>
            <Typography>{data}</Typography>
        </Container>
    );
}

export default Body;
