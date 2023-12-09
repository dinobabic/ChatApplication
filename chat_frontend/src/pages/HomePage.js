import React, { useEffect, useRef, useState } from 'react';
import NavigationComponent from '../components/NavigationComponent';
import SearchUsersComponent from '../components/SearchUsersComponent';
import MainComponent from '../components/MainComponent';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { wait } from '@testing-library/user-event/dist/utils';

const HomePage = (props) => {
    const {jwtIsValid, jwt} = {...props};
    const [chatRooms, setChatRooms] = useState([]);
    const [username, setUsername] = useState("");
    const [change, setChange] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [profileImages, setProfileImages] = useState([]);
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reloadSearchUsers, setReloadSearchUsers] = useState(true);
    const [loadProfileImages, setLoadProfileImages] = useState(false);

    useEffect(() => {
        if (username) {
            axios.get(`api/users/profileImage/${username}`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
		    "Content-Type": "application/json"
                }}
            )
            .then((response) => {
                setUserProfileImage(response.data);
            })
        }
    }, [username]);

    useEffect(() => {
        async function fetchData() {
            const promises = [];

            chatRooms.forEach(room => {
                room.users.forEach((user) => {
                    if (user.username!== username) {
                        const promise = axios.get(`api/users/profileImage/${user.username}`, {
                            headers: {
                                Authorization: `Bearer ${jwt}`,
                                "Content-Type": "application/json"    
			}
                        })
                        .then((response) => ({
                                "username": user.username,
                                "profileImage": response.data
                        }));
                        
                        promises.push(promise);
                    }
                });  
            });

            const results = await Promise.all(promises);
            setProfileImages(Array.from(results));
        } 

        if (loadProfileImages) {
            setLoadProfileImages(false);
            fetchData();
            waitForLoading();
        }

    }, [loadProfileImages]);
    
    useEffect(() => {
        const jwtDecoded = jwtDecode(jwt);
        setUsername(jwtDecoded.username);

        axios.get("api/users/getChatRooms", {
            headers: {
              Authorization: `Bearer ${jwt}`,
		"Content-Type": "application/json"
            }})
        .then(response => {
            setChatRooms(response.data);
            setLoadProfileImages(true);
            if (change) {
                setChange(false);
            }
        });
    }, [change]);

    async function waitForLoading() {
        await wait(1000);
        setLoading(false);
    }
    
    return (
        <>
            <NavigationComponent jwtIsValid={jwtIsValid} jwt={jwt}/>
            <SearchUsersComponent reloadSearchUsers={reloadSearchUsers} setReloadSearchUsers={setReloadSearchUsers} jwt={jwt} chatRooms={chatRooms} setChatRooms={setChatRooms} setChange={setChange} setSelectedUser={setSelectedUser}/>
            <MainComponent setReloadSearchUsers={setReloadSearchUsers} loading={loading} userProfileImage={userProfileImage} profileImages={profileImages} setChange={setChange} setChatRooms={setChatRooms} chatRooms={chatRooms} username={username} jwt={jwt} setSelectedUser={setSelectedUser} selectedUser={selectedUser}/>
        </>
    );
};

export default HomePage;
