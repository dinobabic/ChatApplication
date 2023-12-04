import React from 'react';
import UserIcon from "../images/user-icon.png";

const UserListComponent = (props) => {
    const {chatRooms, username, setSelectedUser} = {...props};


    function userSelected(selectedUser) {
        setSelectedUser(selectedUser);
    }

    return (
        <div className='flex flex-col w-2/5 max-h-96 overflow-y-auto'>
            {chatRooms.map(room => {
                return (
                    room.users.map(user => {
                        if (user.username !== username) {
                            return (
                                <div key={user.username} 
                                    onClick={() => userSelected(user.username)}
                                    className='flex gap-5 items-center p-4 border-b-2 border-green-500 cursor-pointer hover:bg-gray-50'>
                                    <img src={UserIcon} height={40} width={40}/>
                                    <p className='text-xl'>{user.username}</p>
                                </div>
                            );
                        }
                    })
                );
            })}
        </div>
    );
};

export default UserListComponent;