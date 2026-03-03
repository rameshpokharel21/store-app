import { useState } from "react";
import {useLogin} from "../hooks/useLogin";
import {useRegister} from "../hooks/useRegister";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";


const Login = () => {

    const [isRegisterMode, setIsRegisterMode] =  useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const navigate = useNavigate();
    const location = useLocation();
    const {checkAuth} = useAuth();

    //if react router stored a previous page user tried to acces, use that
    const from = location.state?.from?.pathname || "/dashboard";

    const handleLogin = async (e) => {
        e.preventDefault();

        try{
            await loginMutation.mutateAsync({email, password});
            await checkAuth();
            navigate(from, {replace: true});
        }catch(err){
            //handled by errorHandler
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        try{
            await registerMutation.mutateAsync({name, email, password});
            //After registration login automatically
            await loginMutation.mutateAsync({email, password});
            navigate(from, {replace: true});
        }catch(err){

        }
    }
  return (
    <div>
      Login
    </div>
  )
}

export default Login
