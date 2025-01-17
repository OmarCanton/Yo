import {configureStore} from '@reduxjs/toolkit'
import getProfilePictureReducer from '../Slice/getProfilePicture'
import fetchFriendsReducer from '../Slice/fetchFriends'
import peopleReducer from '../Slice/fetchPeople'
import friendReqsReducer from '../Slice/fetchFriendRequests'
// import chatsReducer from '../Slice/fetchChats'
// import fetchMessagesReducer from '../Slice/fetchMessages'
// import sendMessageReducer from '../Slice/sendMessage'
import socketReducer from '../Slice/SocketSlice'
import fetchChatsReducer from '../Slice/fetchUserChats'

const store = configureStore({
    reducer: {
        profilePhoto: getProfilePictureReducer,
        people: peopleReducer,
        friends: fetchFriendsReducer,
        friendRequests: friendReqsReducer,
        chats: fetchChatsReducer,
        // message: fetchMessagesReducer,
        // sendMsg: sendMessageReducer,
        socket: socketReducer
    }
})

export default store