import {useContext, useEffect, useState} from "react";
import {Block, Box, Element} from "react-bulma-components";
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
        <Block>
            <Box>
                <Element>{data}</Element>
            </Box>
        </Block>
    );
}

export default Body;
