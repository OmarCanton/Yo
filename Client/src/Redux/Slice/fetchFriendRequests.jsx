import  { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchRequests = createAsyncThunk('people/fetchRequests', async (userId) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetchRequests/${userId}`)
    return response.data.requests
})


const initState = {
    friendReqs: [],
    status: 'idle'
}

const fetchFriendReqsSlice = createSlice({
    name: 'friendRequests',
    initialState: initState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchRequests.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchRequests.fulfilled, (state, action) => {
            state.status = 'succeeded',
            state.friendReqs = action.payload
        })
        .addCase(fetchRequests.rejected, (state) => {
            state.status = 'failed'
        })
    }
})

export const fetchedFReqs = (state) => state.friendRequests.friendReqs
export const fetchedReqStatus = (state) => state.friendRequests.status
export default fetchFriendReqsSlice.reducer