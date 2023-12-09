import React, { useEffect, useRef, useState } from 'react';
import { VscSend } from "react-icons/vsc";
import axios from 'axios';
import WebSocketComponent from './WebSocketComponent';
import { SlOptionsVertical } from "react-icons/sl";
import { FaPlus } from "react-icons/fa";

const ChatComponent = (props) => {
    const {selectedUser, username, jwt, setChange, setNewMessageNotification, 
        setUserActionNotification, setReloadSearchUsers} = {...props};
    const [chatMessage, setChatMessage] = useState({
        "senderUsername": "",
        "receiverUsername": "",
        "sentAt": "",
        "content": "",
        "messageIdentification": "",
        "image": ""
    });
    const [messages, setMessages] = useState([]);
    const webSocketComponenRef = useRef(null);
    const selectedUserRef = useRef();
    const messagesRef = useRef();
    const chatRef = useRef(null);
    const [updateChat, setUpdateChat] = useState(false);
    const [scroll, setScroll] = useState(false);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState(null);

    useEffect(() => {
        setMessages([...messages, newMessage]);
        setScroll(true);
    }, [newMessage])

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
            setScroll(false);
        }
    }, [chatRef.current, messagesRef.current, scroll, setScroll]);

    useEffect(() => {
        if (selectedUser !== "" && selectedUser) {
            setLoading(true);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (updateChat) {
            setUpdateChat(false);
        }
        else if (selectedUser) {
            selectedUserRef.current = selectedUser;
            axios.get(`api/users/messages/${username}/${selectedUser}`, {
                headers: {
                  Authorization: `Bearer ${jwt}`,
		  "Content-Type": "application/json"
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
                setLoading(false);
            });
        }
    }, [selectedUser, updateChat, setUpdateChat])

    function updateMessageImage(event) {
        const reader = new FileReader();
        if (event.target.files[0])  {
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = (event) => {
                setChatMessage({...chatMessage, image: event.target.result});
                const label = document.querySelector(".image-upload-label");
                label.classList.add("bg-green-200");
            }
        }

        event.target.value = "";
    }

    function changeLabelBg(action) {
        const label = document.querySelector(".image-upload-label");
        if (action === "leave") {
            if (chatMessage.image !== "") {
                label.classList.remove("bg-red-200");
                label.classList.remove("bg-white");
                label.classList.add("bg-green-200");
            }
            else {
                label.classList.remove("bg-red-200");
                label.classList.remove("bg-green-200");
                label.classList.add("bg-white");
            }
        }
        else {
            if (chatMessage.image !== "") {
                label.classList.add("bg-red-200");
                label.classList.remove("bg-green-200");
                label.classList.remove("bg-white");
            }
            else {
                label.classList.remove("bg-red-200");
                label.classList.add("bg-green-200");
                label.classList.remove("bg-white");
            }
        }
    }

    function updateMessage(event) {
        setChatMessage({...chatMessage, content: event.target.value});
    }

    function sendMessage(event) {
        event.preventDefault();
        if (chatMessage.content === "" && chatMessage.image === "") {
            return;
        }

        const label = document.querySelector(".image-upload-label");
        label.classList.remove("bg-green-200");
        label.classList.remove("bg-red-200");
        label.classList.add("bg-white");
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
            "messageIdentification": "",
            "image": ""
        });
    }

    function onMessageReceivedTopic(message) {
        setReloadSearchUsers(true);
    }

    function onMessageReceivedPublic(message) {
        setUserActionNotification(JSON.parse(message.body));
    }

    function onMessageReceivedCustom(message, userIChatWithRef) {
        const newMessage = JSON.parse(message.body);
        if (newMessage?.messageSeen) {
            console.log(newMessage);
            setUpdateChat(true);
        }
        else if (newMessage.senderUsername === userIChatWithRef.current) {
            setNewMessage(newMessage);
            //setUpdateChat(true);
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
            {selectedUser && !loading ? 
                <div className='flex flex-col justify-between w-4/6 px-4'>
                    <div ref={chatRef} className='chat-div flex flex-col gap-4 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-200'>
                        {messages.map((message, index) => {
                            if (!message) {
                                return;
                            }
                            const date = new Date(message.sentAt);
                            const seenAt = !message.seenAt ? null : new Date(message.seenAt);
                            const messageId = "m-" + date.getHours().toString().padStart(2, "0") + date.getMinutes().toString().padStart(2, "0") + date.getSeconds().toString().padStart(2, "0");
                            return (
                                <div
                                    onClick={() => displayMessageOptions(messageId)} 
                                    key={index} className={`group cursor-pointer items-center flex flex-col gap-6 justify-between max-w-fit rounded-lg shadow-lg px-6 py-2 ${message.senderUsername === username ? "self-end justify-end" : ""}`}>
                                    {message.image !== "" && message.image &&
                                        <div>
                                            <img src={message.image} width={100}/>
                                        </div>
                                    }
                                    <div className='flex flex-row gap-6 justify-between'>
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
                        <label onMouseOver={() => changeLabelBg("over")} 
                            onMouseLeave={() => changeLabelBg("leave")}
                          htmlFor='image-input' className='image-upload-label cursor-pointer m-2 p-3 rounded-full shadow-lg'>
                            <FaPlus/>
                            <input  
                                id="image-input"
                                type="file"
                                accept='image/*'
                                onInput={(event) => updateMessageImage(event)}
                                onClick={() => {setChatMessage({...chatMessage, image: ""}); changeLabelBg("over");}}
                                className='hidden'/>
                        </label>
                        <button type='submit' onClick={sendMessage}>
                            <VscSend className='w-10 h-10 ml-2 text-green-500 cursor-pointer'/>
                        </button>
                    </form>
                </div>
            :   
                loading ? 
                    <div className='flex flex-col justify-between w-4/6 px-4 items-center'>
                        <div className="self-center justify-center">
                            <div role="status">
                                <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
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
