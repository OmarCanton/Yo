import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import PropTypes from 'prop-types'
import { UserDetailsContext } from './userDetailsContext'

const SocketConnection = createContext({})

export const UseSocket = () => {
    return useContext(SocketConnection)
}

const SocketProvider = ({children}) => {
    const socket = useRef(null)
    const { userId } = useContext(UserDetailsContext)
    useEffect(() => {
        if(userId) {
            socket.current = io(import.meta.env.VITE_BACKEND_URL, {
                withCredentials: true,
                query: { userId }
            })
        }
    }, [userId])
    return (
        <SocketConnection.Provider value={socket.current}>
            {children}
        </SocketConnection.Provider>
    )
}

SocketProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export default SocketProvider

///******* NOT WORKING!!!!! */