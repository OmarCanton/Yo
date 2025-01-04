import {configureStore} from '@reduxjs/toolkit'
import getProfilePictureReducer from '../Slice/getProfilePicture'
import fetchFriendsReducer from '../Slice/fetchFriends'
import peopleReducer from '../Slice/fetchPeople'
import friendReqsReducer from '../Slice/fetchFriendRequests'
import chatsReducer from '../Slice/fetchChats'
import fetchMessagesReducer from '../Slice/fetchMessages'

const store = configureStore({
    reducer: {
        profilePhoto: getProfilePictureReducer,
        people: peopleReducer,
        friends: fetchFriendsReducer,
        friendRequests: friendReqsReducer,
        chat: chatsReducer,
        message: fetchMessagesReducer
    }
})

export default store