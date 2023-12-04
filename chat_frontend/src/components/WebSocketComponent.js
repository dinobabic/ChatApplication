import React, { useState } from 'react';
import SockJS from 'sockjs-client';

const WebSocketComponent = (props) => {
    const {username} = {...props};
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        
        const initializeStomp = () => {
            const socket = new SockJS('http://localhost:8080/ws');
            const stomp = Stomp.over(socket);
            setStompClient(stomp);
        }

        const subscribeUser = () => {
            if (stompClient) {
                stompClient.subscribe("/user/topic", (message) => {
                    const newMessage  = JSON.parse(message.body);
                    console.log(newMessage);
                    setMessages((prevMessages) =>  [...prevMessages, ...newMessage, newMessage]);
                });

                stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
                    const newMessage  = JSON.parse(message.body);
                    console.log(newMessage);
                    setMessages((prevMessages) =>  [...prevMessages, ...newMessage, newMessage]);
                });

                stompClient.subscribe("/user/public", (message) => {
                    const newMessage  = JSON.parse(message.body);
                    console.log(newMessage);
                    setMessages((prevMessages) =>  [...prevMessages, ...newMessage, newMessage]);
                });
            }
        }

        initializeStomp();
        subscribeUser();

        return () => {
            if (stompClient) {
                stompClient.disconnect(() => {
                    console.log("Discnonnected from STOMP server.");
                });
            }
        }

    }, [stompClient]);

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

    return (
        <div>
            
        </div>
    );
};

export default WebSocketComponent;