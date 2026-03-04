import { useEffect, useState } from "react";
import {useLogin} from "../hooks/useLogin";
import {useRegister} from "../hooks/useRegister";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";


const Login = () => {

    const [isRegisterMode, setIsRegisterMode] =  useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});

    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const navigate = useNavigate();
    const location = useLocation();
    const {checkAuth} = useAuth();

    //if react router stored a previous page user tried to acces, use that
    const from = location.state?.from?.pathname || "/dashboard";

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = "Email is required.";
        if (!password.trim()) newErrors.password = "Password is required.";
        if(isRegisterMode){
            if(!name.trim()) newErrors.name = "Name is required.";
            if(!confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required.";
            if(password && confirmPassword && password !== confirmPassword){
                newErrors.confirmPassword = "Passswords do not match.";
            }
        }
       return newErrors;
        
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        //if any validation errors, return and don't send to backend
        if(Object.keys(validationErrors).length > 0) return;
        try{
            await loginMutation.mutateAsync({email, password});
            await checkAuth();
            navigate(from, {replace: true});
        }catch{
            //handled by errorHandler
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        //if any validation errors, return and don't send to backend
        if(Object.keys(validationErrors).length > 0) return;
        try{
            await registerMutation.mutateAsync({name, email, password});
            //After registration login automatically
            await loginMutation.mutateAsync({email, password});
            navigate(from, {replace: true});
        }catch{

        }
    }

    //clear errors and fields when switching modes
    useEffect(() => {
        const resetForm = () => {
            setErrors({});
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        }
        resetForm();
    }, [isRegisterMode]);



  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>

                <h1 className="text-exl font-bold text-gray-800">
                    {isRegisterMode ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-gray-600 mt-2">
                    {isRegisterMode ? "Sign up to get Started" : "Sign in to continue"}
                </p>
            </div>

            {/*Name only in register mode*/}
            <div>
                {isRegisterMode && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            id="name"
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="John Doe"
                            required
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        id="email"
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="you@example.com"
                        required
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        id="password"
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="........."
                        required
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                {isRegisterMode && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            id="confirm-password"
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder=".........."
                            required
                        />
                        {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                )}

                {(loginMutation.isError || registerMutation.isError) && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        <p className="text-sm text-red-800">
                            {loginMutation.error?.response?.data?.message ||
                                registerMutation.error?.response?.data?.message ||
                                "An error occured. Please try again."}
                        </p>
                    </div>
                )}

                <button
                    onClick={isRegisterMode ? handleRegister : handleLogin}
                    disabled={loginMutation.isPending || registerMutation.isPending}
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {(loginMutation.isPending || registerMutation.isPending) ? (
                        <span className="flex items-center justify-center gap-2">
                            <LoadingSpinner />
                            Processing...
                        </span>
                    ) : isRegisterMode ? "Create Account" : "Sign In"}
                </button>

            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                >
                    {isRegisterMode
                        ? "Already have an account? Sign In"
                        : "Don't have an account? Sign up"}
                </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    Test accounts: user@example.com / user123
                </p>
            </div>
        </div>
    </div>
  )
}

export default Login
