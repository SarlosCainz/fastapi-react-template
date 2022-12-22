import {useContext, useEffect, useState} from "react";
import {Container, Typography} from "@mui/material"

import {AppContext, UserContext} from "../app";
import * as util from "../util";

function Body() {
    const appContext = useContext(AppContext);
    const userContext = useContext(UserContext);

    const [data, setData] = useState("");

    useEffect(() => {
        const config = {
            method: "get",
            url: "hello"
        };
        (async () => {
            try {
                const res = await util.request(config, userContext);
                setData(res.data.message);
            } catch (err) {
                appContext.completed.err(err);
            }
        })();
    }, []);

    return (
        <Container sx={{mt: 1}}>
            <Typography>{data}</Typography>
        </Container>
    );
}

export default Body;
