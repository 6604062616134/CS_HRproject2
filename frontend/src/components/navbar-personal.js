import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function NavbarPersonal() {
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);

    // useEffect(() => {
    //     const fetchUserRole = async () => {
    //         try {
    //             const response = await axios.get('http://localhost:8000/user/getUser', {
    //                 withCredentials: true,
    //             });
    //             setRole(response.data.role); // เข้าถึง role ได้โดยตรง
    //             console.log('User role:', response.data.role);
    //         } catch (error) {
    //             console.error('Error fetching user role:', error);
    //         }
    //     };

    //     fetchUserRole();
    // }, []);

    useEffect(() => {
        const fetchLoggedInUser = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getUser', {
                    withCredentials: true,
                });
                setLoggedInUser(response.data); // เก็บข้อมูลผู้ใช้ใน state
            } catch (error) {
                console.error('Error fetching logged-in user:', error);
            }
        };

        fetchLoggedInUser();
    }, []);

    const handleLogout = async () => {
        try {
            // แสดงกล่องยืนยันก่อนล็อกเอาท์
            const confirmLogout = window.confirm('คุณต้องการออกจากระบบหรือไม่?');
            if (!confirmLogout) {
                return; // หากผู้ใช้กด "ยกเลิก" ให้หยุดการทำงาน
            }

            // เรียก API /logout
            await axios.post('http://localhost:8000/user/logout', {}, { withCredentials: true });
            alert('ออกจากระบบสำเร็จ');
            navigate('/'); // เปลี่ยนเส้นทางไปยังหน้า Login
        } catch (error) {
            console.error('Error during logout:', error);
            alert('เกิดข้อผิดพลาดในการออกจากระบบ');
        }
    };

    return (
        <div>
            <nav className="bg-[#000066] p-4 fixed top-0 left-0 w-full z-50 print:hidden">
                <div className="flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="text-white text-lg font-bold">
                            HR-CS
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-white text-sm font-light">
                            {loggedInUser ? `สวัสดี, ${loggedInUser.username}` : 'กำลังโหลด...'}
                        </div>
                        <button
                            className="text-white underline text-xs hover:text-red-600 transition-all duration-300 ease-in-out"
                            onClick={handleLogout}
                        >
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default NavbarPersonal;