import {useNavigate} from "react-router-dom";
import {MenuItem, Typography, Link} from "@mui/material"

export function FooMenu(props) {
    const {onClose} = props;
    const navigate = useNavigate();

    const handleClick = () => {
        onClose();
        navigate("/foo");
    }

    return (
        <MenuItem onClick={handleClick}><Typography>Foo</Typography></MenuItem>
    )
}

function Foo() {
    return (
        <>
            <Typography>foo</Typography>
            <Link href="/">Goto Main</Link>
        </>
    )
}

export default Foo;
