import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Register = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('')
    const {register} = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await register(name,email, password, role || 'student')
        navigate('/courses') 
    }
  return (
    <div><h2>Register</h2>
    <form onSubmit={handleSubmit}>
        <input type="text" placeholder='Name' value={name} onChange={e => setName(e.target.value)}/>
        <input type="text" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)}/>
        <input type="text" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)}/>
        <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
        </select>
        <button>Register</button>
    </form>
    </div>

    
  )
}

export default Register