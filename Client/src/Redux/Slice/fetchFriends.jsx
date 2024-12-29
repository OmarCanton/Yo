import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'


export const fetchFriends = createAsyncThunk('friends/fetchFriends', async (userId) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetchFriends/${userId}`)
    return response.data.friends
})

const initState = {
    acceptedFriends: [],
    status: 'idle'
}

const fetchFriendsSlice = createSlice({
    name: 'friends',
    initialState: initState,
    extraReducers: (builder) => {
        builder
        .addCase(fetchFriends.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchFriends.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.acceptedFriends = action.payload
        })
        .addCase(fetchFriends.rejected, (state) => {
            state.status = 'failed'
        })
    }
})

export const acptdFriends = (state) => state.friends.acceptedFriends
export const stat = (state) => state.friends.status

export default fetchFriendsSlice.reducer