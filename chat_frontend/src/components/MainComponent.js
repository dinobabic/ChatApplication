import React, { useState } from 'react';
import UserListComponent from './UserListComponent';
import ChatComponent from './ChatComponent';

const MainComponent = (props) => {
    const {chatRooms, username, jwt, sendMessage} = {...props};
    const [selectedUser, setSelectedUser] = useState(null); 

    return (
        <div className='w-3/5 mx-auto mt-14 flex h-96 shadow-lg rounded-lg p-4 relative z-1'>
            <UserListComponent chatRooms={chatRooms} username={username} setSelectedUser={setSelectedUser}/>
            <ChatComponent selectedUser={selectedUser} username={username} jwt={jwt} sendMessage={sendMessage}/>
        </div>
    );
};

export default MainComponent;