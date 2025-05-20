import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/user/login', {
                username,
                password,
            }, { withCredentials: true });

            if (response.data.role?.toLowerCase() === 'superadmin') {
                navigate('/assign');
            } else if (response.data.role?.toLowerCase() === 'teacher') {
                // redirect ไปหน้า detail/teacher/:t_ID
                navigate(`/detail/teacher/${response.data.t_ID}`);
            } else if (response.data.role?.toLowerCase() === 'staff') {
                // redirect ไปหน้า detail/student/:s_ID
                navigate(`/detail/staff/${response.data.s_ID}`);
            }

        } catch (error) {
            console.error('Error during login:', error);
            alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full p-8">
                <div className='text-center mb-2 font-bold text-xl'>HR-CS KMUTNB</div>
                <div className="text-md font-md text-center mb-6">Sign in</div>
                {error && (
                    <div className="mb-4 text-red-600 text-center text-sm">{error}</div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            required
                            className="mt-1 block w-full px-4 py-2 border rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            autoComplete="username" // เพิ่มแอตทริบิวต์นี้
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            required
                            className="mt-1 block w-full px-4 py-2 border rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            autoComplete="current-password" // เพิ่มแอตทริบิวต์นี้
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)} // สลับสถานะ showPassword
                            className="absolute inset-y-0 mt-5 right-3 flex items-center text-gray-500"
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-[#000066] text-white rounded-3xl shadow-lg hover:bg-green-600 hover:scale-105 transition"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;