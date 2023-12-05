import React, { useEffect, useRef, useState } from 'react';
import { VscSend } from "react-icons/vsc";
import axios from 'axios';
import WebSocketComponent from './WebSocketComponent';

const ChatComponent = (props) => {
    const {selectedUser, username, jwt, setChange, setNewMessageNotification} = {...props};
    const [chatMessage, setChatMessage] = useState({
        "senderUsername": "",
        "receiverUsername": "",
        "sentAt": "",
        "content": ""
    });
    const [messages, setMessages] = useState([]);
    const webSocketComponenRef = useRef(null);
    const selectedUserRef = useRef();
    const messagesRef = useRef();
    const chatRef = useRef(null);
    const [updateChat, setUpdateChat] = useState(false);
    const [scroll, setScroll] = useState(false);
    const [connected, setConnected] = useState(false);


    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
            setScroll(false);
        }
    }, [chatRef.current, messagesRef.current, scroll, setScroll]);

    useEffect(() => {
        if (updateChat) {
            setUpdateChat(false);
        }
        else if (selectedUser) {
            selectedUserRef.current = selectedUser;
            axios.get(`/api/users/messages/${username}/${selectedUser}`, {
                headers: {
                  Authorization: `Bearer ${jwt}`
                }}
            )
            .then((response) => {
                setMessages(response.data);
                messagesRef.current = response.data;
                setUpdateChat(false);
            });
        }
    }, [selectedUser, updateChat, setUpdateChat])

    function updateMessage(event) {
        setChatMessage({...chatMessage, content: event.target.value});
    }

    function sendMessage(event) {
        event.preventDefault();
        if (chatMessage.content === "") {
            return;
        }
        let message = {...chatMessage};
        message.senderUsername = username;
        message.receiverUsername = selectedUser;
        message.sentAt = new Date();
        setMessages([...messages, message]);
        setScroll(true);
        webSocketComponenRef.current.sendMessage(message);
        setChatMessage({
            "senderUsername": "",
            "receiverUsername": "",
            "sentAt": "",
            "content": ""
        });
    }

    function onMessageReceivedTopic(message) {
        
    }

    function onMessageReceivedPublic(message) {
        
    }

    function onMessageReceivedCustom(message, userIChatWithRef, userIChatWithMessagesRef) {
        const newMessage = JSON.parse(message.body);
        if (newMessage.senderUsername === userIChatWithRef.current) {
            userIChatWithMessagesRef.current.push(newMessage);
            setMessages(userIChatWithMessagesRef.current);
            messagesRef.current = userIChatWithMessagesRef.current;
            setUpdateChat(true);
        }
        else {
            setNewMessageNotification({
                "username": newMessage.senderUsername,
                "action": "remove"
            });
        }
    }

    function onMessageReceivedChatRoom(message) {
        setChange(true);
    }


    return (
        <>
            { !connected  ?
                <WebSocketComponent subscribeTopic={"/user/topic"} subscribePublic={"/user/public"} 
                        subscribeCustom={`/user/${username}/queue/messages`} subscribeChatRoom={`/user/${username}/queue/chatRoom`} 
                        onMessageReceivedTopic={onMessageReceivedTopic} onMessageReceivedPublic={onMessageReceivedPublic}
                        onMessageReceivedChatRoom={onMessageReceivedChatRoom} setConnected={setConnected} 
                        onMessageReceivedCustom={onMessageReceivedCustom} webSocketComponenRef={webSocketComponenRef} selectedUserRef={selectedUserRef}
                        messagesRef={messagesRef} setMessages={setMessages} ></WebSocketComponent>
                    : <></>}
            {selectedUser ? 
                <div className='flex flex-col justify-between w-4/6 px-4'>
                    <div ref={chatRef} className='chat-div flex flex-col gap-4 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-200'>
                        {messages.map((message, index) => {
                            const date = new Date(message.sentAt);
                            return (
                                <div key={index} className={`flex flex-row gap-6 justify-between max-w-fit rounded-lg shadow-lg px-6 py-2 ${message.senderUsername === username ? "self-end justify-end" : ""}`}>
                                    <p className='text-sm font-semibold max-w-4/5 break-all'>{message.content}</p>
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
                        <button type='submit' onClick={sendMessage}>
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