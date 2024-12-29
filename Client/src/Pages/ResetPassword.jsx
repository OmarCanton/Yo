import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import '../Styles/ResetPassword.css'

export default function ResetPassword () {
    const [newPassword, setPassword] = useState('')
    const [confNewPassword, setConfPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfPassword, setShowConfPassword] = useState(false)
    const {token} = useParams()
    const navigate = useNavigate()

    const resetPassword = async (event) => {
        event.preventDefault()
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reset-password/${token}`, {newPassword, confNewPassword})
            if(response.data.success === true) {
                toast.success(response.data.message, {
                    style: {
                        backgroundColor: 'black',
                        color: 'white'
                    }
                })
                navigate('/auth/signin')
            }
            if(response.data.success === false) {
                toast.error(response.data.error, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            }
        } catch(err) {
            if(err.response) {
                toast.error(err.response.data.message, {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            } else {
                toast.error('An Unknown error occured', {
                    style: {
                        backgroundColor: 'white',
                        color: 'black'
                    }
                })
            }
        }
    }
    
    
    return (
        <div className="resetPassword-wrapper">
            <div className="main">
                <h2>Reset Password</h2>
                <div className="form">
                    <form onSubmit={resetPassword}>
                        <div className="password">
                            <input 
                                type={ showPassword ? 'text' : 'password' } 
                                name="newPassword" 
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Enter new Password'
                            />
                            { showPassword ? 
                                <VisibilityOff 
                                    onClick={() => setShowPassword(prevState => !prevState)}  
                                    htmlColor='grey' 
                                    style={{cursor: 'pointer'}} 
                                    className='showPass'
                                /> 
                                : 
                                <Visibility 
                                    htmlColor='#3C3C3C' 
                                    style={{cursor: 'pointer'}}
                                    onClick={() => setShowPassword(prevState => !prevState)} 
                                    className='showPass'
                                /> 
                            }
                        </div>
                        <div className="confPassword">
                            <input 
                                type={ showConfPassword ? 'text' : 'password' } 
                                name="newPassword"
                                onChange={(e) => setConfPassword(e.target.value)}
                                placeholder='Confirm new Password'
                            />
                            { showConfPassword ? 
                                <VisibilityOff 
                                    htmlColor='grey' 
                                    style={{cursor: 'pointer'}} 
                                    onClick={() => setShowConfPassword(prevState => !prevState)} 
                                    className='showPass'
                                /> 
                                : 
                                <Visibility 
                                    htmlColor='#3C3C3C' 
                                    style={{cursor: 'pointer'}} 
                                    onClick={() => setShowConfPassword(prevState => !prevState)} 
                                    className='showPass'
                                /> 
                            }
                        </div>
                        <button>Submit</button>
                    </form>
                </div>
            </div>
        </div>
    )
}