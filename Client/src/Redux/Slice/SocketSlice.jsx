import { createSlice } from '@reduxjs/toolkit'

const initState = {
    socketConnection: null,
}

const socketSlice = createSlice({
    name: 'socket',
    initialState: initState,
    reducers: {
        setSocketConnection: (state, action) => {
            state.socketConnection = action.payload
        }
    }
})

export const socketConct = (state) => state.socket.socketConnection

export const { setSocketConnection } = socketSlice.actions
export default socketSlice.reducer