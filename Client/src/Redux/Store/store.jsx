import {configureStore} from '@reduxjs/toolkit'
import getProfilePictureReducer from '../Slice/getProfilePicture'
import fetchFriendsReducer from '../Slice/fetchFriends'
const store = configureStore({
    reducer: {
        profilePhoto: getProfilePictureReducer,
        friends: fetchFriendsReducer,
    }
})

export default store