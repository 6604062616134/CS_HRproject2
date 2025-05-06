import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

function Admin() {
    const [users, setUsers] = useState([]); // เก็บข้อมูลผู้ใช้
    const [isEditMode, setIsEditMode] = useState(false); // true = แก้ไข, false = เพิ่ม
    const [isModalOpen, setIsModalOpen] = useState(false); // ควบคุมการแสดงผลของ Modal
    const [editUser, setEditUser] = useState(null); // เก็บข้อมูลผู้ใช้ที่ต้องการแก้ไข

    axios.defaults.withCredentials = true;

    axios.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                // ป้องกันการ alert ซ้ำ
                if (!window.sessionExpiredHandled) {
                    window.sessionExpiredHandled = true;
                    alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                    window.location.href = '/';
                }
            }
            return Promise.reject(error);
        }
    );

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getAllUser', {
                    withCredentials: true,
                }); // ดึงข้อมูลผู้ใช้จาก API
                setUsers(Array.isArray(response.data) ? response.data : []); // ตรวจสอบว่าเป็นอาร์เรย์
            } catch (error) {
                console.error('Error fetching users:', error);
                alert('เกิดข้อผิดพลาดในการดึงข้อมูล'); // แจ้งข้อผิดพลาดทั่วไป
            }
        };

        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        setEditUser(user); // ตั้งค่าผู้ใช้ที่ต้องการแก้ไข
        setIsEditMode(true); // เปิดโหมดแก้ไข
        setIsModalOpen(true); // เปิด Modal
    };

    const handleModalClose = () => {
        setIsModalOpen(false); // ปิด Modal
        setEditUser(null); // ล้างข้อมูลผู้ใช้ที่แก้ไข
    };

    const handleAddUserClick = () => {
        setEditUser({ username: '', password: '', role: '' }); // ตั้งค่าเริ่มต้นสำหรับผู้ใช้ใหม่
        setIsEditMode(false); // เปิดโหมดเพิ่ม
        setIsModalOpen(true); // เปิด Modal
    };

    const handleSave = async () => {
        try {
            if (editUser.id) {
                // แก้ไขผู้ใช้เดิม
                await axios.put(`http://localhost:8000/user/updateUser/${editUser.id}`, editUser, {
                    withCredentials: true,
                });
                alert('บันทึกข้อมูลสำเร็จ');
            } else {
                // เพิ่มผู้ใช้ใหม่
                await axios.post('http://localhost:8000/user/createUser', editUser, {
                    withCredentials: true,
                });
                alert('เพิ่มผู้ใช้ใหม่สำเร็จ');
            }

            setIsModalOpen(false); // ปิด Modal
            setEditUser(null); // ล้างข้อมูลผู้ใช้ที่แก้ไข

            // อัปเดตข้อมูลผู้ใช้ใหม่
            const response = await axios.get('http://localhost:8000/user/getAllUser', {
                withCredentials: true,
            });
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    const handleDelete = async () => {
        try {
            // แสดงกล่องยืนยันก่อนลบ
            const confirmDelete = window.confirm('คุณต้องการลบผู้ใช้นี้หรือไม่?');
            if (!confirmDelete) {
                return; // หากผู้ใช้กด "ยกเลิก" ให้หยุดการทำงาน
            }

            // เรียก API เพื่อลบผู้ใช้
            await axios.delete(`http://localhost:8000/user/deleteUser/${editUser.id}`, {
                withCredentials: true,
            });
            alert('ลบข้อมูลสำเร็จ');
            setIsModalOpen(false); // ปิด Modal
            setEditUser(null); // ล้างข้อมูลผู้ใช้ที่แก้ไข

            // อัปเดตข้อมูลผู้ใช้ใหม่
            const response = await axios.get('http://localhost:8000/user/getAllUsers', {
                withCredentials: true,
            });
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-col p-4 mt-16 flex-grow w-full items-center">
                <div className="px-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">จัดการผู้ใช้</h2>
                        <button
                            className="px-3 py-1 bg-green-600 text-sm shadow-lg text-white rounded-3xl hover:bg-green-700 hover:scale-105 transition-all duration-300 ease-in-out"
                            onClick={handleAddUserClick}
                        >
                            เพิ่มผู้ใช้ใหม่
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white border border-gray-300 rounded-3xl">
                            <thead>
                                <tr className="bg-gray-200 text-gray-700">
                                    <th className="px-4 py-2 border text-xs text-center w-24">ลำดับ</th>
                                    <th className="px-4 py-2 border text-xs text-center w-32">Username</th>
                                    <th className="px-4 py-2 border text-xs text-center w-32">Role</th>
                                    <th className="px-4 py-2 border text-xs text-center w-24">แก้ไข</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border text-xs text-center w-24">{index + 1}</td>
                                            <td className="px-4 py-2 border text-xs text-left w-96">{user.username}</td>
                                            <td className="px-4 py-2 border text-xs text-center w-48">{user.role}</td>
                                            <td className="px-4 py-2 border text-xs text-center w-24">
                                                <button
                                                    className="px-2 py-1 bg-[#000066] text-white rounded-3xl z-50 hover:scale-105 hover:bg-white hover:text-black shadow-lg transition-transform duration-300"
                                                    onClick={() => handleEditClick(user)}
                                                >
                                                    แก้ไข
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-2 text-left text-xs text-gray-500">
                                            ไม่มีข้อมูลผู้ใช้
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            {isEditMode ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
                        </h3>
                        <div className="mb-4">
                            {isEditMode && (
                                <button
                                    className="px-4 py-2 bg-red-600 text-right text-white rounded-3xl hover:bg-red-700 hover:scale-105 transition-all duration-300 ease-in-out"
                                    onClick={handleDelete}
                                >
                                    ลบผู้ใช้
                                </button>
                            )}
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={editUser.username}
                                placeholder="username"
                                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <input
                                type="text"
                                value={editUser.role}
                                placeholder="role"
                                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-3xl hover:bg-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={handleModalClose}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="px-4 py-2 bg-[#000066] text-white rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={handleSave}
                            >
                                {isEditMode ? 'บันทึก' : 'เพิ่ม'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;