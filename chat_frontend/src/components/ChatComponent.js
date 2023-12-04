import React, { useEffect, useRef, useState } from 'react';
import { VscSend } from "react-icons/vsc";
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const ChatComponent = (props) => {
    const {selectedUser, username, jwt, sendMessage} = {...props};
    const [chatMessage, setChatMessage] = useState({
        "senderUsername": "",
        "receiverUsername": "",
        "sentAt": "",
        "content": ""
    });
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (selectedUser) {
            axios.get(`api/users/messages/${username}/${selectedUser}`, {
                headers: {
                  Authorization: `Bearer ${jwt}`
                }}
            )
            .then((response) => {
                setMessages(response.data);
            });
        }
    }, [selectedUser])

    function updateMessage(event) {
        setChatMessage({...chatMessage, content: event.target.value});
    }

    function sendMessageToUser(event) {
        event.preventDefault();
        let message = {...chatMessage};
        message.senderUsername = username;
        message.receiverUsername = selectedUser;
        message.sentAt = new Date();
        sendMessage(message);
        setChatMessage({
            "senderUsername": "",
            "receiverUsername": "",
            "sentAt": "",
            "content": ""
        });
    }
    //{message.sentAt.getHours()}:{message.sentAt.getMinutes()}
    return (
        <>
            {selectedUser ? 
                <div className='flex flex-col justify-between w-3/5 px-4'>
                    <div className='flex flex-col gap-4 overflow-y-auto py-4'>
                        {messages.map((message, index) => {
                            const date = new Date(message.sentAt);
                            return (
                                <div key={index} className={`flex flex-row gap-6 justify-between max-w-fit rounded-lg shadow-lg px-6 py-2 ${message.senderUsername === username ? "self-end justify-end" : ""}`}>
                                    <p className='text-sm font-semibold'>{message.content}</p>
                                    <p className='text-xs self-end justify-end'>{date.getHours().toString().padStart(2, "0")}:{date.getMinutes().toString().padStart(2, "0")}</p>
                                </div>
                            );
                        })}
                    </div>
                    <form className='w-full flex items-center'>
                        <input 
                            value={chatMessage.content}
                            onChange={updateMessage}
                            type='text'
                            className='w-full shadow-md rounded-md border-2 border-slate-300 outline-none h-8 py-5 px-4 text-lg'/>
                        <button type='submit' onClick={sendMessageToUser}>
                            <VscSend className='w-10 h-10 ml-2 text-green-500 cursor-pointer'/>
                        </button>
                    </form>
                </div>
            :   
                <div className='flex items-center justify-center w-3/5'>
                    <p className='text-2xl'>Selecte user to chat with!</p>
                </div>
            }
            
        </>
    );
};

export default ChatComponent;