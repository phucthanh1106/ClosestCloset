import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Github } from 'lucide-react';
import { useLogin } from "../hooks/useLogin";
import toast from 'react-hot-toast';
import API_BASE_URL from '../config.js';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const { login, error, isLoading } = useLogin();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.dismiss();

        const loginError = await login(email, password);

        if (loginError != null) {
            toast.error(loginError, {
                id: "login-status"
            });
        } else {
            toast.success('Login successfully!', {
                id: "login-status"
            })
            navigate("/");
        }
    };

    return (
        <div className="flex font-poppins min-h-screen items-center justify-center">
            <form 
                className="w-full max-w-[400px] rounded-2xl bg-[oklch(21%_0.01_250)] p-10 shadow-2xl " 
                onSubmit={handleSubmit}
            >
                <h3 className="mb-8 text-center text-5xl font-bold text-gray-300">Login</h3>

                <div className="mb-4">
                    <input
                        type="email"
                        className="w-full rounded-full text-m bg-white/8 py-3 pl-5 pr-12 text-white placeholder-white/70 outline-none"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        placeholder="Email"
                    />
                </div>

                <div className="mb-6 relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="w-full text-m rounded-full  bg-white/8 py-3 pl-5 pr-12 text-white placeholder-white/70 outline-none"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        placeholder="Password"
                    />

                    {/* 4. The Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>

                <button disabled={isLoading} className="w-full rounded-full font-poppins bg-white py-2 font-semibold text-black transition-colors hover:bg-green-400">
                    Sign in
                </button>

                <div className="my-5 flex items-center gap-3 text-sm text-gray-500">
                    <div className="h-px flex-1 bg-white/10" />
                    <span>or continue with</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* OAuth buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = `${API_BASE_URL}/api/auth/google`;
                        }}
                        className="flex w-1/2 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 py-2 font-poppins font-semibold text-white transition-colors hover:bg-white/15"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#EA4335" d="M21.6 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.38a4.6 4.6 0 0 1-1.99 3.02v2.52h3.23c1.89-1.74 2.98-4.3 2.98-7.57Z" />
                            <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.23-2.52c-.9.6-2.05.95-3.39.95-2.61 0-4.83-1.76-5.62-4.13H3.04v2.6A10 10 0 0 0 12 22Z" />
                            <path fill="#4A90E2" d="M6.38 13.87A6 6 0 0 1 6.07 12c0-.65.11-1.28.31-1.87v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.47l3.34-2.6Z" />
                            <path fill="#FBBC05" d="M12 6c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.97 3.02 14.7 2 12 2a10 10 0 0 0-8.96 5.53l3.34 2.6C7.17 7.76 9.39 6 12 6Z" />
                        </svg>
                        Google
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = `${API_BASE_URL}/api/auth/github`;
                        }}
                        className="flex w-1/2 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 py-2 font-poppins font-semibold text-white transition-colors hover:bg-white/15"
                    >
                        <Github size={18} aria-hidden="true" />
                        GitHub
                    </button>
                </div>
                
                <p className="mt-4 text-center text-sm text-gray-500">
                    Don't have an account? <Link to="/signup" className="text-blue-500 font-bold cursor-pointer hover:text-blue-400">Sign up</Link>
                </p>
            </form>
        </div>
    )
}
