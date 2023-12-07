import React, { useEffect, useState } from 'react';

const UserListComponent = (props) => {
    const {chatRooms, username, setSelectedUser, senderUsernameNotification, selectedUser, jwt, profileImages} = {...props};

    useEffect(() => {
        if (senderUsernameNotification.username !== "") {
            if (senderUsernameNotification.action === "add") {
                document.querySelector(`.${senderUsernameNotification.username}`)?.classList.add("hidden");
            }
            else {
                document.querySelector(`.${senderUsernameNotification.username}`)?.classList.remove("hidden");
            }
        }
    }, [senderUsernameNotification]);

    useEffect(() => {
        if (selectedUser && document.querySelector(`.${selectedUser}`)) {
            if (document.querySelector(`.${selectedUser}`).classList.add("hidden")) {
                document.querySelector(`.${selectedUser}`).classList.add("hidden");
            } 
        }
    }, [setSelectedUser, selectedUser]); 


    function userSelected(selectedUser) {
        setSelectedUser(selectedUser);
    }

    return (
        <div className='flex flex-col scrollbar-thin scrollbar-thumb-gray-200 w-2/6 max-h-96 overflow-y-auto'>
            {profileImages.length >0 && chatRooms.map(room => {
                return (
                    room.users.map((user, index) => {
                        if (user.username !== username) {
                            return (
                                <div key={user.username} 
                                    onClick={() => userSelected(user.username)}
                                    className='flex gap-5 items-center p-4 border-b-2 border-green-500 cursor-pointer hover:bg-gray-50'>
                                    <div className='flex flex-row gap-5 items-center'>
                                    {<img className='rounded-full' src={profileImages.filter((image) => image.username === user.username)[0]?.profileImage} style={{height: "60px", width: "60px"}}/>}
                                        <p className='text-xl'>{user.username}</p>
                                    </div>
                                    <div className={`h-3 w-3 rounded-full bg-yellow-300 hidden ${user.username}`}></div>
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