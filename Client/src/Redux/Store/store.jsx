import {configureStore} from '@reduxjs/toolkit'
import getProfilePictureReducer from '../Slice/getProfilePicture'
import fetchFriendsReducer from '../Slice/fetchFriends'
import peopleReducer from '../Slice/fetchPeople'
import friendReqsReducer from '../Slice/fetchFriendRequests'

const store = configureStore({
    reducer: {
        profilePhoto: getProfilePictureReducer,
        people: peopleReducer,
        friends: fetchFriendsReducer,
        friendRequests: friendReqsReducer,
    }
})

export default store