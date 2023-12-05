import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const WebSocketComponent = (props) => {
    const {subscribeTopic, subscribePublic, subscribeCustom, subscribeChatRoom,
        onMessageReceivedTopic, onMessageReceivedPublic, onMessageReceivedCustom, onMessageReceivedChatRoom,
        webSocketComponenRef, selectedUserRef, messagesRef, setMessages,
        chatRoomsRef, setConnected, children} = {...props};
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        
        const initializeStomp = () => {
            if (!stompClient) {
                const socket = new SockJS('/ws');
                const stomp = Stomp.over(socket);
                stomp.connect({}, () => setStompClient(stomp));
            }
        }

        initializeStomp();

        return;

    }, [stompClient]);

    useEffect(() => {
        if (stompClient && stompClient.connected) {
            if (setConnected) {
                setConnected(true);
            }
            if (subscribeTopic) {
                stompClient.subscribe("/user/topic", (message) => {
                    onMessageReceivedTopic(message);
                });
            }

            if (subscribePublic) {
                stompClient.subscribe("/user/public", (message) => {
                    onMessageReceivedPublic(message);
                });
            }

            if (subscribeCustom) {
                stompClient.subscribe(subscribeCustom, (message) => {
                    onMessageReceivedCustom(message, selectedUserRef, messagesRef, setMessages);
                });   
            }

            if (subscribeChatRoom) {
                stompClient.subscribe(subscribeChatRoom, (message) => {
                    onMessageReceivedChatRoom(message, chatRoomsRef);
                });   
            }
        }
    }, [stompClient, setStompClient]);

    const sendMessage = (message) => {
        if (stompClient) {
            stompClient.send("/app/chat", {}, JSON.stringify(message));
        }
    }

    const logout = (user) => {
        if (stompClient) {
            stompClient.send("/app/user.disconnectUser", {}, JSON.stringify(user));
        }
    }

    const authenticate = (body) => {
        if (stompClient) {
            stompClient.send(`/app/authenticate/user.addUser`, {}, JSON.stringify(body));
        }
    }
    
    const register = (body) => {
        if (stompClient) {
            stompClient.send(`/app/register/user.addUser`, {}, JSON.stringify(body));
        }
    }

    useEffect(() => {
        if (stompClient) {
            webSocketComponenRef.current = {
                authenticate,
                register,
                sendMessage,
                logout
              };
        }
    }, [stompClient]);

    return children;
};

export default WebSocketComponent;