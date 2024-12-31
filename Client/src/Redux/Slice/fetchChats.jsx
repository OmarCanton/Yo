import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchChats = createAsyncThunk('chat/fetchChats', async (userId) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetchChats/${userId}`)
    return response.data.chats
})

const initState = {
    chats: [],
    status: 'idle'
}

const fetchChatsSlice = createSlice({
    name: 'chat',
    initialState: initState,
    extraReducers: (builder) => {
        builder
        .addCase(fetchChats.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchChats.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.chats = action.payload
        })
        .addCase(fetchChats.rejected, (state) => {
            state.status = 'failed'
        })
    }
})

export const userChats = (state) => state.chat.chats
export const chatFetchStatus = (state) => state.chat.status

export default fetchChatsSlice.reducer