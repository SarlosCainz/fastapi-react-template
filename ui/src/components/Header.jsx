import {Navbar, Heading} from "react-bulma-components";
import logo from "../../icon-192.png";


function Header() {
    return (
        <>
            <Navbar color="light" fixed="top">
                <Navbar.Brand>
                    <Navbar.Item mx={3} href="/">
                        <img src={logo} alt="FastAPI-React-Template"/>
                        <Heading ml={2} size={4} textColor="grey-dark" display="flex">
                            FastAPI-React-Template for BULMA
                        </Heading>
                    </Navbar.Item>
                </Navbar.Brand>
            </Navbar>
        </>
    );
}

export default Header;
