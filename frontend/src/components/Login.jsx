import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../utils/axiosInstance'
import { validateEmail } from '../utils/helper'
import { API_PATHS } from '../utils/apiPaths';
import { authStyles as styles } from '../assets/dummystyle'
import Input from './Input';


const Login = ({setCurrentPage}) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) =>{
    e.preventDefault();
    if(!validateEmail(email)){
      setError('Please enter a valid email address')
      return;
    }
    if(!password){
      setError('Please enter password')
      return;
    }
    setError('');
    try{
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {email, password});
      const { token }=response.data;
      if(token){
        localStorage.setItem('token', token)
        updateUser(response.data);
        navigate('/dashboard')
      }
    }
    catch(error){
      setError(error.response?.data?.message || 'Something went wrong. Please try again. ')
    }


  }

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h3 className={styles.title}>
          Welcome Back
        </h3>
        <p className={styles.subtitle}>
          Sign in to continue building amazing resume
        </p>
      </div>
      {/*FORM*/}
      <form onSubmit={ handleLogin } className={styles.form}>
        <Input value={ email } onChange={({ target })=>setEmail(target.value)}
        label = 'Email'
        placeholder = 'brawlyservices@exaple.com'
        type='email'
        />
        <Input value={ password } onChange={({ target })=>setPassword(target.value)}
        label = 'Password'
        placeholder = 'Min 8 characters'
        type='password'
        />
        {error && <div className = {styles.errorMessage }>{error}</div>}
        <button type='submit' className={styles.submitButton}>
          Sign In
        </button>
        <p className={styles.switchText}>
          Don't have an account{' '}
          <button type='button' className={styles.switchButton} 
          onClick={()=>setCurrentPage('signup')} >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  )
}

export default Login
