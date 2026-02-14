import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from "../hooks/useLogin";
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const { login, error, isLoading } = useLogin();
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginError = await login(email, password);

        if (loginError != null) {
            toast.error(loginError, {
                id: "signup-status"
            });
        } else {
            toast.success('Login successfully!', {
                id: "signup-status"
            })
            navigate("/my-closet");
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
                
                <p className="mt-4 text-center text-sm text-gray-500">
                    Don't have an account? <Link to="/signup" className="text-blue-500 font-bold cursor-pointer hover:text-blue-400">Sign up</Link>
                </p>
            </form>
        </div>
    )
}