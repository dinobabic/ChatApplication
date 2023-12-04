import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const connectToWebSocket = (body, setJwt, setError, setInitializedWebSocket, stompClient, setStompClient) => {
    return new Promise((resolve, reject) => {
        const socket = new SockJS('http://localhost:8080/ws');
        let tmpStompClient = Stomp.over(socket);
        setStompClient(tmpStompClient);
        tmpStompClient.connect({}, () => onConnected(body, setJwt, setError, setInitializedWebSocket, tmpStompClient));
    });
};

const initializeWebSocketConnection = async (body, setJwt, setError, setInitializedWebSocket, stompClient, setStompClient) => {
    connectToWebSocket(body, setJwt, setError, setInitializedWebSocket, stompClient, setStompClient);
};

const onConnected = (body, setJwt, setError, setInitializedWebSocket, stompClient) => {
    stompClient.subscribe(`/user/${body.username}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/public`, onMessageReceived);
    stompClient.subscribe(`/user/topic`, (message) => onMessageTokenReceived(message, setJwt, setError));
    setInitializedWebSocket(true);
}

const logout = (body, stompClient) => {
    stompClient.send(`/app/user.disconnectUser`, {}, JSON.stringify(body));
}

const sendMessage = (body, stompClient) => {
    stompClient.send(`/app/chat`, {}, JSON.stringify(body));
}

const authenticate = (body, stompClient) => {
    stompClient.send(`/app/authenticate/user.addUser`, 
        {}, 
        JSON.stringify(body));
}

const register = (body, stompClient) => {
    stompClient.send(`/app/register/user.addUser`, 
        {}, 
        JSON.stringify(body));
}

const onMessageReceived = (message) => {
    console.log(message);
}

const onMessageTokenReceived = (message, setJwt, setError) => {
    const jwt = JSON.parse(message.body).body.token;
    if (jwt === "") {
        setError(true);
    }
    else {
        setJwt(jwt);
    }
}

export {initializeWebSocketConnection, logout, authenticate, register, sendMessage}