import React, { useEffect, useState } from 'react';
import NavigationComponent from '../components/NavigationComponent';
import SearchUsersComponent from '../components/SearchUsersComponent';
import MainComponent from '../components/MainComponent';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const HomePage = (props) => {
    const {jwtIsValid, jwt, logout, sendMessage} = {...props};
    const [chatRooms, setChatRooms] = useState([]);
    const [usrename, setUsername] = useState("");
    const [change, setChange] = useState(false);
    
    useEffect(() => {
        const jwtDecoded = jwtDecode(jwt);
        setUsername(jwtDecoded.username);

        axios.get("api/users/getChatRooms", {
            headers: {
              Authorization: `Bearer ${jwt}`
            }})
        .then(response => {
            setChatRooms(response.data);
            if (change) {
                setChange(false);
            }
        });
    }, [change]);
    
    return (
        <>
            <NavigationComponent jwtIsValid={jwtIsValid} jwt={jwt} logout={logout}/>
            <SearchUsersComponent jwt={jwt} chatRooms={chatRooms} setChatRooms={setChatRooms} setChange={setChange}/>
            <MainComponent chatRooms={chatRooms} username={usrename} jwt={jwt} sendMessage={sendMessage}/>
        </>
    );
};

export default HomePage;