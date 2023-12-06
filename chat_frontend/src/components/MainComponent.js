import React, { useState } from 'react';
import UserListComponent from './UserListComponent';
import ChatComponent from './ChatComponent';
import MainComponentHeader from './MainComponentHeader';

const MainComponent = (props) => {
    const {chatRooms, username, jwt, selectedUser, setSelectedUser, setChange} = {...props};
    const [senderUsernameNotification, setSenderUsernameNotification] = useState({
        "username": "",
        "action": ""
    });
    const [userActionNotification, setUserActionNotification] = useState(null);

    function setNewMessageNotification(newSenderUsernameNotification) {
        setSenderUsernameNotification(newSenderUsernameNotification);
    }
    

    return (
        <div className='w-3/5 mx-auto mt-14'>
            <MainComponentHeader userActionNotification={userActionNotification} setUserActionNotification={setUserActionNotification} username={username} selectedUser={selectedUser} jwt={jwt} />
            <div className='flex h-96 shadow-lg rounded-lg p-4 relative z-1'>
                <UserListComponent jwt={jwt} selectedUser={selectedUser} chatRooms={chatRooms} username={username} setSelectedUser={setSelectedUser} senderUsernameNotification={senderUsernameNotification}/>
                <ChatComponent setUserActionNotification={setUserActionNotification} setChange={setChange} selectedUser={selectedUser} username={username} jwt={jwt} setNewMessageNotification={setNewMessageNotification} />
            </div>
        </div>
    );
};

export default MainComponent;