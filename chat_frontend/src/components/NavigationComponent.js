import React, { useEffect, useRef, useState } from 'react';
import WhatsAppIcon from "../images/favicon.ico";
import Cookies from 'universal-cookie';
import {useNavigate} from "react-router-dom"
import { jwtDecode } from 'jwt-decode';
import WebSocketComponent from './WebSocketComponent';

const NavigationComponent = (props) => {
    const cookies = new Cookies();
    let {jwtIsValid, jwt} = {...props};
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const webSocketComponenRef = useRef(null);

    useEffect(() => {
        if (jwt) {
            const jwtDecoded = jwtDecode(jwt);
            setUsername(jwtDecoded.username);
        }
    }, []);
    
    function logout() {
        cookies.remove("jwt");
        webSocketComponenRef.current.logout({
            "username": username
        });
        window.location.reload();
    }

    function register() {
        navigate("/register");
    }

    return (
        <div className='flex bg-green-500 h-24 justify-between px-20 py-8 shadow-xl'>
            <div className='flex gap-3 items-center'>
                <img src={WhatsAppIcon} height={60} width={60}/> 
                <p className='text-white text-3xl'>KajImaApp</p>
            </div>
            {jwtIsValid && <p className='text-white text-3xl'>Hello{username !== "" ? `, ${username}` : ""}</p>}
            {!jwtIsValid && <p className='text-white text-3xl'>Hello</p>}
            {jwtIsValid && 
                <WebSocketComponent webSocketComponenRef={webSocketComponenRef}>
                    <p className='text-white text-xl cursor-pointer hover:border-b-2' onClick={logout}>Log Out</p>
                </WebSocketComponent>
            }
            {!jwtIsValid && <p className='text-white text-xl cursor-pointer hover:border-b-2' onClick={register}>Register</p>}
        </div>
    );
};

export default NavigationComponent;