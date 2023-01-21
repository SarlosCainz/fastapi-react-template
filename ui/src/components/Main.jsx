import {useContext, useEffect, useState, useRef} from "react";
import {useParams} from "react-router-dom";
import {Typography} from "@mui/material"

import {AppContext, UserContext} from "../app";
import * as util from "../util";

function Body() {
    const appContext = useContext(AppContext);
    const userContext = useContext(UserContext);

    const refFirstRef = useRef(true);

    const [data, setData] = useState("");

    useEffect(() => {
        if (import.meta.env.DEV && refFirstRef.current) {
            refFirstRef.current = false;
            return;
        }

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
        <>
            <Typography>data = {data}</Typography>
        </>
    );
}

export default Body;
