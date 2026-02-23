import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext"; 
import axios from "axios";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl: backend, token, setToken } = useContext(AppContext)

  const [state, setState] = useState('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Add your authentication logic here
    try{
      if(state==='Signup'){
        const {data}=await axios.post(backend+"/api/user/register",{name,email,password})
        if(data.success){
          localStorage.setItem("token",data.token)
          setToken(data.token)
        }else{
          toast.error(data.message)
        }
      }
      else{
        const {data}=await axios.post(backend+"/api/user/login",{email,password})
        if(data.success){
          localStorage.setItem("token",data.token)
          setToken(data.token)
        }else{
          toast.error(data.message)
        }
      }

    }
    catch{
      toast.error("Something went wrong")
    }
  };
  useEffect(()=>{
    if(token){
     
      navigate("/")
    }
  },[token])
  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center justify-center" onSubmit={onSubmitHandler}> 
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
        
        {state === 'Sign Up' && (
          <div className="w-full">
            <p>Full Name</p>
            <input 
              className="border border-zinc-300 rounded w-full p-2 mt-1" 
              type="text" 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              required 
            />
          </div>
        )}
        
        <div className="w-full">
          <p>Email</p>
          <input 
            className="border border-zinc-300 rounded w-full p-2 mt-1" 
            type="email" 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            required 
          />
        </div>
        
        <div className="w-full">
          <p>Password</p>
          <input 
            className="border border-zinc-300 rounded w-full p-2 mt-1" 
            type="password" 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            required 
          />
        </div>
        
        <button   
          className="bg-primary text-white w-full py-2 rounded-md text-base hover:bg-primary/90 transition-all" 
          type="submit"
        >
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>
        
        {state === 'Sign Up' ? (
          <p>
            Already have an account? 
            <span 
              onClick={() => setState('Login')} 
              className="text-primary underline cursor-pointer ml-1"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account? 
            <span 
              onClick={() => setState('Sign Up')} 
              className="text-primary underline cursor-pointer ml-1"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
