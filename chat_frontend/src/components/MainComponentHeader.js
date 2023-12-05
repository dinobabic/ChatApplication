import React, { useEffect, useState } from 'react';
import UserImage from "../images/user-icon.png";
import { SlOptionsVertical } from "react-icons/sl";
import axios from 'axios';

const MainComponentHeader = (props) => {
    const {username, selectedUser, jwt} = {...props};
    const [selectedUserDB, setSelectedUserDB] = useState(null);

    useEffect(() => {
        setSelectedUserDB(null);
        if (selectedUser) {
            axios.get(`api/users/status/${selectedUser}`, {
                headers: {
                  Authorization: `Bearer ${jwt}`
                }}
            )
            .then((response) => {
                setSelectedUserDB(response.data);
            })
        }
    }, [selectedUser]);

    const displayOptions = () => {
        const options = document.querySelector(".options");
        if (options.classList.contains("hidden")) {
            options.classList.remove("hidden");
        }
        else {
            options.classList.add("hidden");
        }
    };

    const deleteMessages = () => {
        axios.delete(`api/users/delete/messages/${username}/${selectedUser}`, {
            headers: {
              Authorization: `Bearer ${jwt}`
            }});
        window.location.reload();
    };

    const deleteContact = () => {
        axios.delete(`api/users/delete/chatRoom/${username}/${selectedUser}`, {
            headers: {
              Authorization: `Bearer ${jwt}`
            }});
        window.location.reload();
    };

    return (
        <div className='flex flex-row justify-between rounded-t-md bg-gray-50 py-3 px-10'>
            <div className='flex flex-row gap-5 items-center'>
                <img className='rounde-full' src={UserImage} width={50} />
                <div className='flex flex-col'>
                    <p className='text-2xl font-semibold'>{username}</p>
                    <p className='text-green-500 text-xs'>ONLINE</p>
                </div>
            </div>
            {selectedUser && selectedUserDB && 
                <div className='flex flex-row gap-5 items-center'>
                    <div className='flex flex-col'>
                        <p className='text-2xl font-semibold'>{selectedUser}</p>
                        <p className={`text-xs ${selectedUserDB.status === "ONLINE" ? "text-green-500" : "text-red-500"}`}>{selectedUserDB.status}</p>
                    </div>
                    <img className='rounde-full' src={UserImage} width={50} />
                    <div className='p-1 cursor-pointer relative' onClick={displayOptions}>
                        <SlOptionsVertical />
                        <div className='absolute hidden flex-col gap-2 rounded-md shadow-md options z-10 w-[200px] bg-white'>
                            <p className='my-3 mx-5 font-bold text-md text-end p-2'>x</p>
                            <p className='text-md font-semibold my-3 mx-5 border-b-2 border-b-gray-200 text-center'
                                onClick={deleteMessages}>Delete Messages</p>
                            <p className='text-md font-semibold my-3 mx-5 border-b-2 border-b-gray-200 text-center'
                                onClick={deleteContact}>Delete Contact</p>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default MainComponentHeader;