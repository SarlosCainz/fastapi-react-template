import {useContext, useEffect, useState} from "react";
import {Container, Typography, Button, TextareaAutosize} from "@mui/material"

import {AppContext, SimpleDialog, UserContext} from "../app";
import * as util from "../util";

function Body() {
    const appContext = useContext(AppContext);
    const userContext = useContext(UserContext);

    const [data, setData] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        (async () => {
            await handleHelloClick();
        })();
    }, []);

    const handleHelloClick = async () => {
        const config = {
            method: "get",
            url: "hello"
        };
        try {
            const res = await util.request(config, userContext);
            setData(res.data.message);
        } catch (err) {
            appContext.completed.err(err);
        }
    }

    const handleFooClick = () => {
        setDialogOpen(true);
        const ws = new WebSocket(import.meta.env.VITE_WS_URL + "?token=" + userContext.accessToken);
        ws.onopen = () => {
            ws.send("foo");
        }
        ws.onmessage = (e) => {
            console.log(e.data);
            setMessage(message + e.data);
        }
    }
    const handleDialogClose = () => setDialogOpen(false)

    return (
        <>
            <Container sx={{mt: 1}}>
                <Typography>{data}</Typography>
                <Button onClick={handleHelloClick}>Hello</Button>
                <Button onClick={handleFooClick}>Foo</Button>
            </Container>
            <SimpleDialog open={dialogOpen} onClose={handleDialogClose} title="foo">
                <TextareaAutosize value={message} minRows={3} maxRows={10} style={{width: 500}}/>
            </SimpleDialog>
        </>
    );
}

export default Body;
