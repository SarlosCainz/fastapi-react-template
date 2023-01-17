import {useEffect} from "react";
import {useParams} from "react-router-dom";

function Login() {
    const params = useParams();
    const code = params.code;

    console.log("login: " + code);

    useEffect(() => {

    }, [code]);
}