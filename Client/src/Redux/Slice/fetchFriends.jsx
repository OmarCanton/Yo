import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'


export const fetchFriends = createAsyncThunk('friends/fetchFriends', async (userId) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetchFriends/${userId}`)
    return response.data.friends
})
export const searchFriend = createAsyncThunk('friends/searchFriend', async ({userId, keyword}) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/findFriend/${userId}/${keyword}`)
    return response.data.searchedFriends
})

const initState = {
    acceptedFriends: [],
    isSearch: false,
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
        .addCase(searchFriend.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchFriends.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.acceptedFriends = action.payload
            state.isSearch = false
        })
        .addCase(searchFriend.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.acceptedFriends = action.payload
            state.isSearch = true
        })
        .addCase(fetchFriends.rejected, (state) => {
            state.status = 'failed'
        })
        .addCase(searchFriend.rejected, (state) => {
            state.status = 'failed'
        })
    }
})

export const acptdFriends = (state) => state.friends.acceptedFriends
export const stat = (state) => state.friends.status
export const search = (state) => state.friends.isSearch

export default fetchFriendsSlice.reducer