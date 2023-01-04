import {useContext, useEffect, useState} from "react";
import {Typography} from "@mui/material"

import {AppContext, UserContext} from "../app";
import * as util from "../util";

function Body() {
    const appContext = useContext(AppContext);
    const userContext = useContext(UserContext);

    const [data, setData] = useState("");

    useEffect(() => {
        (async () => {
            appContext.backdrop.open();
            const config = {
                method: "get",
                url: "hello"
            };
            try {
                const res = await util.request(config, userContext);
                setData(res.data.message);
            } catch (err) {
                appContext.completed.err(err);
            } finally {
                appContext.backdrop.close();
            }
        })();
    }, []);

    return (
        <Typography>{data}</Typography>
    );
}

export default Body;
