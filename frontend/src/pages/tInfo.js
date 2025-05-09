import { useState, useEffect, use } from "react";
import axios from "axios";
import Navbar from "../components/navbar";

function TInfo() {
    const [teacherData, setTeacherData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTeacher, setEditTeacher] = useState(null);
    const [passwords, setPasswords] = useState({});
    const [teacherAccountData, setTeacherAccountData] = useState(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [academicRanks, setAcademicRanks] = useState([
        'ผศ.',
        'ผศ.ดร.',
        'รศ.ดร.',
        'ศ.ดร.',
        'อ.',
        'อ.ดร.',
    ]);
    const [newTeacher, setNewTeacher] = useState({
        t_name: "",
        t_code: "",
        t_tel: "",
        t_email: "",
        t_AcademicRanks: "",
        username: "", // เพิ่มฟิลด์ username
        password: "", // เพิ่มฟิลด์ password
    });

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/teacher/', {
                    withCredentials: true,
                });
                setTeacherData(response.data);
            } catch (error) {
                console.error('Error fetching teacher data:', error);
            }
        };

        fetchTeacherData();
    }, []);

    useEffect(() => {
        const fetchTeacherAccounts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getAllTeacherAccount', {
                    withCredentials: true,
                });
                setTeacherAccountData(response.data);
            } catch (error) {
                console.error('Error fetching teacher accounts:', error);
            }
        }

        fetchTeacherAccounts();
    }, []);

    const handleChangePassword = async (t_ID, oldPassword, newPassword) => {
        try {
            const response = await axios.put(`http://localhost:8000/user/changePassword/${t_ID}`, {
                oldPassword,
                newPassword,
            }, {
                withCredentials: true,
            });
            alert(response.data.message); // แจ้งเตือนเมื่อเปลี่ยนรหัสผ่านสำเร็จ
        } catch (error) {
            console.error('Error changing password:', error);
            alert(error.response?.data?.error || 'Failed to change password');
        }
    };

    const handleDelete = async (teacherId) => {
        try {
            await axios.delete(`http://localhost:8000/teacher/delete/${teacherId}`, {
                withCredentials: true,
            });
            setTeacherData((prevData) => prevData.filter((teacher) => teacher.t_ID !== teacherId));
            setIsModalOpen(false); // ปิด Modal หลังลบสำเร็จ
        } catch (error) {
            console.error('Error deleting teacher:', error);
        }
    };

    const handleEdit = (teacher) => {
        console.log('Editing teacher:', teacher);
        setEditTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:8000/teacher/update/${editTeacher.t_ID}`, editTeacher, {
                withCredentials: true,
            });
            setTeacherData((prevData) =>
                prevData.map((teacher) =>
                    teacher.t_ID === editTeacher.t_ID ? editTeacher : teacher
                )
            );
            setIsModalOpen(false);
            alert('อัปเดตข้อมูลสำเร็จ!'); // แจ้งเตือนเมื่ออัปเดตสำเร็จ
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล'); // แจ้งเตือนเมื่อเกิดข้อผิดพลาด
        }
    };

    const handleAddTeacher = async () => {
        try {
            // เรียก API เพื่อเพิ่มข้อมูลอาจารย์และบัญชีผู้ใช้
            const teacherResponse = await axios.post('http://localhost:8000/teacher/create', {
                t_name: newTeacher.t_name,
                t_code: newTeacher.t_code,
                t_tel: newTeacher.t_tel,
                t_email: newTeacher.t_email,
                t_AcademicRanks: newTeacher.t_AcademicRanks,
                username: newTeacher.username, // ส่ง username
                password: newTeacher.password, // ส่ง password
            }, {
                withCredentials: true,
            });

            const newTeacherId = teacherResponse.data.t_ID; // รับ t_ID ที่สร้างใหม่จาก API
            alert('เพิ่มอาจารย์สำเร็จ!');
            setIsAddModalOpen(false);

            // อัปเดตข้อมูลในตาราง
            setTeacherData((prevData) => [...prevData, { ...newTeacher, t_ID: newTeacherId }]);
        } catch (error) {
            console.error('Error adding teacher:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มอาจารย์');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <Navbar className="print:hidden" />
            <div className="flex flex-col p-4 px-20 mt-16 print:mt-0 flex-grow w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">ข้อมูลอาจารย์</h2>
                    <button
                        className="px-3 py-1 bg-[#000066] text-sm text-white rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        เพิ่มอาจารย์
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table-auto text-xs min-w-full max-w-xl mx-auto bg-white border border-gray-300 rounded-3xl">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="px-2 py-2 border text-xs text-center w-[3%]">ID</th>
                                <th className="px-2 py-2 border text-xs text-center w-[5%]">ตำแหน่งทางวิชาการ</th>
                                <th className="px-2 py-2 border text-xs text-center w-[20%]">ชื่อ</th>
                                <th className="px-2 py-2 border text-xs text-center w-[5%]">รหัส</th>
                                <th className="px-2 py-2 border text-xs text-center w-[20%]">อีเมล</th>
                                <th className="px-2 py-2 border text-xs text-center w-[5%]">เบอร์โทรภายใน</th>
                                <th className="px-2 py-2 border text-xs text-center w-[10%] print:hidden">username</th>
                                <th className="px-2 py-2 border text-xs text-center w-[5%] print:hidden">แก้ไข</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teacherData && teacherData.length > 0 ? (
                                teacherData.map((teacher, index) => {
                                    const account = teacherAccountData?.find(acc => acc.t_ID === teacher.t_ID) || {};
                                    return (
                                        <tr key={index}>
                                            <td className="px-2 py-2 border text-xs text-center w-[3%]">{teacher.t_ID}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[5%]">{teacher.t_AcademicRanks}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[20%]">{teacher.t_name}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[5%]">{teacher.t_code}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[20%]">{teacher.t_email}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[5%]">{teacher.t_tel}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[10%] print:hidden">{account.username || '-'}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[5%] print:hidden">
                                                <button
                                                    onClick={() => handleEdit(teacher)}
                                                    className="print:hidden px-2 py-1 bg-[#000066] text-white rounded-3xl hover:scale-105 hover:bg-white hover:text-black shadow-lg transition-transform duration-300"
                                                >
                                                    แก้ไข
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-2 py-2 text-center text-xs text-gray-500">
                                        ไม่มีข้อมูลอาจารย์
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-md font-semibold">แก้ไขข้อมูลอาจารย์</div>
                            <button
                                className="text-red-600 underline text-sm hover:text-red-800 transition-all duration-200"
                                onClick={() => handleDelete(editTeacher.t_ID)}
                            >
                                ลบอาจารย์
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">รหัสผ่านเดิม</label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    value={passwords[editTeacher.t_ID]?.oldPassword || ""}
                                    placeholder="กรอกรหัสผ่านเดิม"
                                    onChange={(e) =>
                                        setPasswords((prev) => ({
                                            ...prev,
                                            [editTeacher.t_ID]: {
                                                ...prev[editTeacher.t_ID],
                                                oldPassword: e.target.value,
                                            },
                                        }))
                                    }
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-sm text-blue-500 hover:text-blue-700"
                                >
                                    {showOldPassword ? "ซ่อน" : "แสดง"}
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwords[editTeacher.t_ID]?.newPassword || ""}
                                    placeholder="กรอกรหัสผ่านใหม่"
                                    onChange={(e) =>
                                        setPasswords((prev) => ({
                                            ...prev,
                                            [editTeacher.t_ID]: {
                                                ...prev[editTeacher.t_ID],
                                                newPassword: e.target.value,
                                            },
                                        }))
                                    }
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-sm text-blue-500 hover:text-blue-700"
                                >
                                    {showNewPassword ? "ซ่อน" : "แสดง"}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-3xl text-sm hover:bg-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="px-4 py-2 bg-[#000066] text-white text-sm rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={() =>
                                    handleChangePassword(
                                        editTeacher.t_ID,
                                        passwords[editTeacher.t_ID]?.oldPassword || "",
                                        passwords[editTeacher.t_ID]?.newPassword || ""
                                    )
                                }
                            >
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">ตำแหน่งทางวิชาการ</label>
                            <input
                                type="text"
                                value={editTeacher.t_AcademicRanks}
                                placeholder="กรอกตำแหน่งทางวิชาการ"
                                onChange={(e) => setEditTeacher({ ...editTeacher, t_AcademicRanks: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">เบอร์โทรภายใน</label>
                            <input
                                type="text"
                                value={editTeacher.t_tel}
                                onChange={(e) => setEditTeacher({ ...editTeacher, t_tel: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                            <input
                                type="email"
                                value={editTeacher.t_email}
                                onChange={(e) => setEditTeacher({ ...editTeacher, t_email: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 text-sm bg-gray-300 rounded-3xl hover:bg-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="px-4 py-2 bg-[#000066] text-sm text-white rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={handleSave}
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isAddModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-2xl">
                        <div className="font-semibold mb-4 text-md">เพิ่มอาจารย์</div>
                        <div className="flex space-x-4 mb-4">
                            {/* Dropdown สำหรับตำแหน่งทางวิชาการ */}
                            <div className="flex-1 relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">ตำแหน่งทางวิชาการ</label>
                                <div
                                    className="px-4 py-2 border text-sm rounded-3xl bg-white cursor-pointer focus:outline-none z-50 text-sm hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 ease-in-out flex items-center justify-between"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {newTeacher.t_AcademicRanks || 'เลือกตำแหน่งวิชาการ'}
                                    <span className={`ml-2 transform transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                                {isDropdownOpen && (
                                    <div
                                        className="absolute z-[9999] text-sm mt-2 w-full max-h-64 overflow-y-auto bg-white border rounded-3xl shadow-lg"
                                        style={{ top: '100%' }}
                                    >
                                        <div
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                                            onClick={() => {
                                                setNewTeacher({ ...newTeacher, t_AcademicRanks: '' });
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            -
                                        </div>
                                        {['ผศ.', 'ผศ.ดร.', 'รศ.ดร.', 'ศ.ดร.', 'อ.', 'อ.ดร.'].map((rank) => (
                                            <div
                                                key={rank}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                                                onClick={() => {
                                                    setNewTeacher({ ...newTeacher, t_AcademicRanks: rank });
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {rank}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="w-2/3">
                                <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    value={newTeacher.t_name}
                                    placeholder="กรอกชื่อ-นามสกุล"
                                    onChange={(e) => setNewTeacher({ ...newTeacher, t_name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4 mb-4 text-sm">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                                <input
                                    type="email"
                                    placeholder="กรอกอีเมล"
                                    value={newTeacher.t_email}
                                    onChange={(e) => setNewTeacher({ ...newTeacher, t_email: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4 mb-4 text-sm">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">รหัส</label>
                                <input
                                    type="text"
                                    placeholder="กรอกรหัสอาจารย์"
                                    value={newTeacher.t_code}
                                    onChange={(e) => setNewTeacher({ ...newTeacher, t_code: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">เบอร์โทรภายใน</label>
                                <input
                                    type="text"
                                    value={newTeacher.t_tel}
                                    placeholder="กรอกเบอร์โทรภายใน 4 หลัก"
                                    onChange={(e) => setNewTeacher({ ...newTeacher, t_tel: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4 mb-4 text-sm">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    value={newTeacher.username}
                                    placeholder="กรอกชื่อบัญชีอาจารย์"
                                    onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={newTeacher.password}
                                    placeholder="กรอกรหัสผ่านบัญชี"
                                    onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 text-sm">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-3xl hover:bg-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="px-4 py-2 bg-[#000066] text-white rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={handleAddTeacher}
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TInfo;