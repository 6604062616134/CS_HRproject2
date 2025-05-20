import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function NavbarPersonal() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportMessage, setReportMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
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

    const handleSendReport = async (e) => {
        e.preventDefault();
        if (!reportMessage.trim()) {
            alert('กรุณากรอกข้อความที่ต้องการรายงาน');
            return;
        }
        setIsSending(true);
        try {
            // ส่งข้อมูลไป backend (ต้องมี API /user/createReport)
            await axios.post(
                'http://localhost:8000/user/createReport',
                {
                    reportMessage,
                    t_ID: loggedInUser?.role === 'teacher' ? loggedInUser.t_ID : null,
                    s_ID: loggedInUser?.role === 'staff' ? loggedInUser.s_ID : null,
                },
                { withCredentials: true }
            );
            alert('ส่งรายงานถึงแอดมินเรียบร้อยแล้ว');
            setShowReportModal(false);
            setReportMessage('');
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการส่งรายงาน');
        } finally {
            setIsSending(false);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div>
            <nav className="bg-[#000066] p-4 fixed top-0 left-0 w-full z-50 print:hidden">
                <div className="flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="text-white text-lg font-bold">
                            HR-CS
                        </div>
                        <div className="text-white text-sm font-light">
                            {loggedInUser ? `สวัสดี, ${loggedInUser.username}` : 'กำลังโหลด...'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* แสดงเฉพาะเมื่อเป็น staff */}
                        {loggedInUser?.role === "staff" && (
                            <>
                                <button
                                    className={`px-3 py-1 rounded-3xl text-xs font-semibold shadow-lg transition-all duration-300 ease-in-out
                                        ${isActive(`/detail/staff/${loggedInUser.s_ID}`) ? 'bg-blue-400 text-white' : 'bg-white text-[#000066] hover:scale-105'}
                                    `}
                                    onClick={() => navigate(`/detail/staff/${loggedInUser.s_ID}`)}
                                >
                                    ตารางกิจกรรมของฉัน
                                </button>
                                <button
                                    className={`px-3 py-1 rounded-3xl text-xs font-semibold shadow-lg transition-all duration-300 ease-in-out
                                        ${isActive('/project') ? 'bg-blue-400 text-white' : 'bg-white text-[#000066] hover:scale-105'}
                                    `}
                                    onClick={() => navigate('/project')}
                                >
                                    ตารางการสอบโปรเจค
                                </button>
                                <button
                                    className={`px-3 py-1 rounded-3xl text-xs font-semibold shadow-lg transition-all duration-300 ease-in-out
                                        ${isActive('/staffproject') ? 'bg-blue-400 text-white' : 'bg-white text-[#000066] hover:scale-105'}
                                    `}
                                    onClick={() => navigate('/staffproject')}
                                >
                                    ตารางตรวจโปรเจคสำหรับเจ้าหน้าที่
                                </button>
                            </>
                        )}
                        {/* ปุ่มรายงานถึงแอดมิน แสดงทุก role */}
                        <button
                            className="bg-green-500 text-white px-3 py-1 rounded-3xl text-xs font-semibold shadow hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                            onClick={() => setShowReportModal(true)}
                        >
                            รายงานถึงแอดมิน
                        </button>
                        {/* ปุ่มออกจากระบบ */}
                        <button
                            className="text-white underline text-xs hover:text-red-600 transition-all duration-300 ease-in-out ml-2"
                            onClick={handleLogout}
                        >
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </nav>
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowReportModal(false)}>
                    <div
                        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            รายงานถึงแอดมิน
                        </h3>
                        <form onSubmit={handleSendReport}>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-3xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#000066] transition"
                                rows={4}
                                placeholder="กรอกข้อความที่ต้องการรายงาน"
                                value={reportMessage}
                                onChange={e => setReportMessage(e.target.value)}
                                required
                                disabled={isSending}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-3xl hover:bg-red-500 hover:text-white transition"
                                    onClick={() => setShowReportModal(false)}
                                    disabled={isSending}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-3xl hover:bg-green-700 transition"
                                    disabled={isSending}
                                >
                                    {isSending ? 'กำลังส่ง...' : 'ส่ง'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NavbarPersonal;