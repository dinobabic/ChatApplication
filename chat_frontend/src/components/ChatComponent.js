import React, { useEffect, useRef, useState } from 'react';
import { VscSend } from "react-icons/vsc";
import axios from 'axios';
import WebSocketComponent from './WebSocketComponent';
import { SlOptionsVertical } from "react-icons/sl";

const ChatComponent = (props) => {
    const {selectedUser, username, jwt, setChange, setNewMessageNotification, 
        setUserActionNotification} = {...props};
    const [chatMessage, setChatMessage] = useState({
        "senderUsername": "",
        "receiverUsername": "",
        "sentAt": "",
        "content": "",
        "messageIdentification": ""
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
            axios.get(`api/users/messages/${username}/${selectedUser}`, {
                headers: {
                  Authorization: `Bearer ${jwt}`
                }}
            )
            .then((response) => {
                setMessages(response.data.sort((el1, el2) => el1.messageIdentification.localeCompare(el2.messageIdentification)));
                let unSeenedMessages = response.data.filter(message => !message.seenAt && message.receiverUsername === username);
                unSeenedMessages.forEach((message) => message.seenAt = new Date());
                
                if (unSeenedMessages.length > 0) {
                    axios.put("api/users/updateMessages", JSON.stringify(unSeenedMessages), {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${jwt}`
                        }});
                }

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
        const date = new Date();
        message.sentAt = date;
        setScroll(true);
        webSocketComponenRef.current.sendMessage(message);
        date.setHours(date.getHours() +1);
        message.messageIdentification = date.toISOString().replace("T", " ").replace("Z", "");
        date.setHours(date.getHours() - 1);
        setMessages([...messages, message]);
        setChatMessage({
            "senderUsername": "",
            "receiverUsername": "",
            "sentAt": "",
            "content": "",
            "messageIdentification": ""
        });
    }

    function onMessageReceivedTopic(message) {
        
    }

    function onMessageReceivedPublic(message) {
        setUserActionNotification(JSON.parse(message.body));
    }

    function onMessageReceivedCustom(message, userIChatWithRef, userIChatWithMessagesRef) {
        const newMessage = JSON.parse(message.body);
        if (newMessage?.messageSeen) {
            setUpdateChat(true);
        }
        else if (newMessage.senderUsername === userIChatWithRef.current) {
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

    const displayMessageOptions = (messageId) => {
        const div = document.querySelector(`.${messageId}`);
        if (div.classList.contains("hidden")) {
            div.classList.remove('hidden');
            div.classList.add('flex');
        }
        else {
            div.classList.remove('flex');
            div.classList.add('hidden');
        }
    }

    const deleteMessage = (messageId, seenAt) => {
        if (!seenAt) {
            deleteMessageForMe(messageId, "deleteForEveryone");
        }
        else {
            deleteMessageForMe(messageId, "delete");
        }
    }

    const deleteMessageForMe = (messageId, path) => {
        const body = {
            "messageIdentification": new Date(messageId),
            "senderUsername": username,
            "receiverUsername": selectedUser
        };

        axios.put(`api/users/${path}/message`, JSON.stringify(body), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`
        }})
        .then((response) => {
            setUpdateChat(true);
        });
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
                            const seenAt = !message.seenAt ? null : new Date(message.seenAt);
                            const messageId = "m-" + date.getHours().toString().padStart(2, "0") + date.getMinutes().toString().padStart(2, "0") + date.getSeconds().toString().padStart(2, "0");
                            return (
                                <div
                                    onClick={() => displayMessageOptions(messageId)} 
                                    key={index} className={`group cursor-pointer items-center flex flex-row gap-6 justify-between max-w-fit rounded-lg shadow-lg px-6 py-2 ${message.senderUsername === username ? "self-end justify-end" : ""}`}>
                                    <p className='text-sm font-semibold max-w-4/5 break-all'>{message.content}</p>
                                    <div className='flex items-center gap-1'>
                                        <p className='text-xs self-end justify-end'>{date.getHours().toString().padStart(2, "0")}:{date.getMinutes().toString().padStart(2, "0")}</p>
                                        
                                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity`}>
                                            <SlOptionsVertical />
                                        </div>

                                        <div className={`${messageId} hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
                                            <div className="relative p-4 w-full max-w-sm max-h-full">
                                                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                                    <div className="flex items-center justify-between border-b-2 border-b-gray-100 p-1 rounded-t dark:border-gray-600">
                                                        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                                                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className='flex flex-col'>
                                                        {!seenAt ? <p className='text-center font-semibold text-lg border-b-2 border-b-gray-100 py-2 hover:bg-gray-100'>The message was not seen</p> : 
                                                                <p className='text-center font-semibold text-lg border-b-2 border-b-gray-100 py-2 hover:bg-gray-100'>Message seen at: {seenAt.getHours().toString().padStart(2, "0")}:{seenAt.getMinutes().toString().padStart(2, "0")}</p>}   
                                                        <p 
                                                            onClick={() => deleteMessageForMe(message.messageIdentification, "delete")}
                                                            className='text-center font-semibold text-lg cursor-pointer border-b-2 border-b-gray-100 py-2 hover:bg-gray-100'>Delete message for me</p>
                                                        <p 
                                                            onClick={() => deleteMessage(message.messageIdentification, seenAt)}
                                                            className='flex flex-col items-center justify-center gap-2 font-semibold text-lg cursor-pointer border-b-2 border-b-gray-100 py-2 hover:bg-gray-100'>Delete message 
                                                                {seenAt && <span className='text-red-500 font-thin text-xs'>  (Message was already seen, it will be deleted only for you.)</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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