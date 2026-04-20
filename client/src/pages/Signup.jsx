import { useState }  from "react";
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useSignup } from "../hooks/useSignup";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signup, isLoading } = useSignup();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.dismiss();

        // Validate passwords match
        if (password !== confirmPassword) {
            toast.error("Passwords do not match", {
                id: "signup-status"
            });
            return;
        }

        const signupError = await signup(email, password);

        if (signupError != null) {
            toast.error(signupError, {
                id: "signup-status"
            });
        } else {
            toast.success('Account created successfully!', {
                id: "signup-status"
            })
            navigate('/');
        }
    };

    return (
        <div className="flex font-poppins min-h-screen items-center justify-center">
            <form 
                className="w-full max-w-[400px] rounded-2xl bg-[oklch(21%_0.01_250)] p-10 shadow-2xl " 
                onSubmit={handleSubmit}
            >
                <h3 className="mb-8 text-center text-5xl font-bold text-gray-300">Sign Up</h3>

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

                    {/* Password visibility toggle */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>

                <div className="mb-2 relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full text-m rounded-full  bg-white/8 py-3 pl-5 pr-12 text-white placeholder-white/70 outline-none"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        placeholder="Confirm Password"
                    />

                    {/* Confirm password visibility toggle */}
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                        {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>

                {/* Password match indicator - outside relative container */}
                {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-sm mb-6">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                    <p className="text-green-400 text-sm mb-6">Passwords match</p>
                )}
                {!confirmPassword && (
                    <div className="mb-6"></div>
                )}


                <button 
                    disabled={isLoading || password !== confirmPassword || !password || !confirmPassword || !email}
                    className="w-full rounded-full font-poppins bg-white py-2 font-semibold text-black transition-colors hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sign up
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-blue-500 font-bold cursor-pointer hover:text-blue-400">Log in</Link>
                </p>
            </form>
        </div>
    )
}