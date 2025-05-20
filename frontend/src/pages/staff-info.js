import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar";

function SInfo() {
    const [staffData, setStaffData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editStaff, setEditStaff] = useState(null);
    const [passwords, setPasswords] = useState({});
    const [staffAccountData, setStaffAccountData] = useState(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newStaff, setNewStaff] = useState({
        s_name: "",
        username: "",
        password: "",
    });
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
        const fetchStaffData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/staff/', {
                    withCredentials: true,
                });
                setStaffData(response.data);
            } catch (error) {
                console.error('Error fetching staff data:', error);
            }
        };

        fetchStaffData();
    }, []);

    useEffect(() => {
        const fetchStaffAccounts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getAllStaffAccount', {
                    withCredentials: true,
                });
                setStaffAccountData(response.data);
            } catch (error) {
                console.error('Error fetching staff accounts:', error);
            }
        }

        fetchStaffAccounts();
    }, []);

    const handleDelete = async (staffId) => {
        const confirmDelete = window.confirm("ลบข้อมูลเจ้าหน้าที่ ?");
        if (!confirmDelete) return;
        try {
            await axios.delete(`http://localhost:8000/staff/delete/${staffId}`, {
                withCredentials: true,
            });
            setStaffData((prevData) => prevData.filter((staff) => staff.s_ID !== staffId));
            setIsModalOpen(false); // ปิด Modal หลังลบสำเร็จ
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const handleEdit = (staff) => {
        const account = staffAccountData?.find(acc => acc.s_ID === staff.s_ID);
        setEditStaff({
            ...staff,
            username: account?.username || ""
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const oldPwd = passwords[editStaff.s_ID]?.oldPassword;
        const newPwd = passwords[editStaff.s_ID]?.newPassword;
        // เช็กว่ากรอกช่องรหัสผ่านเดิมหรือใหม่แค่ช่องเดียว
        if ((oldPwd && !newPwd) || (!oldPwd && newPwd)) {
            return alert("กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่ให้ครบทั้งสองช่อง");
        }
        // เช็กว่ารหัสผ่านใหม่เหมือนรหัสผ่านเดิม
        if (oldPwd && newPwd && oldPwd === newPwd) {
            return alert("รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านเดิม");
        }
        try {
            const res = await axios.put(
                `http://localhost:8000/staff/update/${editStaff.s_ID}`,
                {
                    s_name: editStaff.s_name,
                    username: editStaff.username,
                    oldPassword: oldPwd || "",
                    newPassword: newPwd || "",
                },
                { withCredentials: true }
            );
            // ตรวจสอบว่ามี error ใน response หรือไม่
            if (res.data?.error) {
                alert(res.data.error);
                return;
            }
            setStaffData((prevData) =>
                prevData.map((staff) =>
                    staff.s_ID === editStaff.s_ID ? { ...staff, ...editStaff } : staff
                )
            );
            setIsModalOpen(false);
            setPasswords((prev) => ({
                ...prev,
                [editStaff.s_ID]: { oldPassword: "", newPassword: "" }
            }));
            alert('อัปเดตข้อมูลสำเร็จ!');
        } catch (error) {
            if (error.response?.data?.error === "Old password is incorrect") {
                alert("รหัสผ่านเดิมไม่ถูกต้อง");
            } else {
                console.error('Error updating staff:', error);
                alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
            }
        }
    };

    const handleAddStaff = async () => {
        try {
            const staffResponse = await axios.post('http://localhost:8000/staff/create', {
                s_name: newStaff.s_name,
                username: newStaff.username,
                password: newStaff.password,
            }, {
                withCredentials: true,
            });

            const newStaffId = staffResponse.data.s_ID; // รับ t_ID ที่สร้างใหม่จาก API
            alert('เพิ่มเจ้าหน้าที่สำเร็จ!');
            setIsAddModalOpen(false);

            // อัปเดตข้อมูลในตาราง
            setStaffData((prevData) => [...prevData, { ...newStaff, s_ID: newStaffId }]);
        } catch (error) {
            console.error('Error adding staff:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มเจ้าหน้าที่');
        }
    };

    const filteredStaffData = staffData
        ? staffData.filter((staff) => {
            const account = staffAccountData?.find(acc => acc.s_ID === staff.s_ID) || {};
            const search = searchTerm.trim().toLowerCase();
            return (
                staff.s_name?.toLowerCase().includes(search) ||
                account.username?.toLowerCase().includes(search)
            );
        })
        : [];

    return (
        <div className="flex flex-col h-screen">
            <Navbar className="print:hidden" />
            <div className="flex flex-col p-4 px-20 mt-16 print:mt-0 flex-grow w-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-row gap-4">
                        <h2 className="text-xl font-semibold">ข้อมูลเจ้าหน้าที่</h2>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="ค้นหาชื่อหรือ username"
                            className="px-4 py-2 border rounded-3xl text-xs focus:outline-none focus:ring-2 focus:ring-[#000066] w-80 mr-2"
                        />
                    </div>
                    <button
                        className="px-3 py-1 bg-[#000066] shadow-lg text-sm text-white rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        เพิ่มเจ้าหน้าที่
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table-auto text-xs min-w-full max-w-xl mx-auto bg-white border border-gray-300 rounded-3xl">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="px-2 py-2 border text-xs text-center w-[3%]">ลำดับ</th>
                                <th className="px-2 py-2 border text-xs text-center w-[20%]">ชื่อ</th>
                                <th className="px-2 py-2 border text-xs text-center w-[10%] print:hidden">username</th>
                                <th className="px-2 py-2 border text-xs text-center w-[5%] print:hidden">แก้ไข</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaffData && filteredStaffData.length > 0 ? (
                                filteredStaffData.map((staff, index) => {
                                    const account = staffAccountData?.find(acc => acc.s_ID === staff.s_ID) || {};
                                    return (
                                        <tr key={index}>
                                            <td className="px-2 py-2 border text-xs text-center w-[3%]">{index + 1}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[5%]">{staff.s_name}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[10%] print:hidden">{account.username || '-'}</td>
                                            <td className="px-2 py-2 border text-xs text-center w-[5%] print:hidden">
                                                <button
                                                    onClick={() => handleEdit(staff)}
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
                                    <td colSpan="4" className="px-2 py-2 text-center text-xs text-gray-500">
                                        ไม่มีข้อมูลเจ้าหน้าที่
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && editStaff && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-md font-semibold">แก้ไขข้อมูลเจ้าหน้าที่</div>
                            <button
                                className="text-red-600 underline text-sm hover:text-red-800 transition-all duration-200"
                                onClick={() => handleDelete(editStaff.s_ID)}
                            >
                                ลบเจ้าหน้าที่
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">รหัสผ่านเดิม</label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    value={passwords[editStaff.s_ID]?.oldPassword || ""}
                                    placeholder="กรอกรหัสผ่านเดิม"
                                    onChange={(e) =>
                                        setPasswords((prev) => ({
                                            ...prev,
                                            [editStaff.s_ID]: {
                                                ...prev[editStaff.s_ID],
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
                                    value={passwords[editStaff.s_ID]?.newPassword || ""}
                                    placeholder="กรอกรหัสผ่านใหม่"
                                    onChange={(e) =>
                                        setPasswords((prev) => ({
                                            ...prev,
                                            [editStaff.s_ID]: {
                                                ...prev[editStaff.s_ID],
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
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">ชื่อเจ้าหน้าที่</label>
                            <input
                                type="text"
                                value={editStaff.s_name}
                                onChange={(e) => setEditStaff({ ...editStaff, s_name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={editStaff.username || ""}
                                placeholder="กรอกชื่อบัญชีเจ้าหน้าที่ใหม่"
                                onChange={(e) => setEditStaff({ ...editStaff, username: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-3xl text-sm hover:bg-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                className="px-4 py-2 bg-[#000066] shadow-lg text-white text-sm rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={handleSave}
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isAddModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setIsAddModalOpen(false)}>
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="font-semibold mb-4 text-md">เพิ่มเจ้าหน้าที่</div>
                        <div className="flex space-x-4 mb-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    value={newStaff.s_name}
                                    placeholder="กรอกชื่อ-นามสกุล"
                                    onChange={(e) => setNewStaff({ ...newStaff, s_name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                />
                            </div>
                        </div>
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={newStaff.username}
                                placeholder="กรอกชื่อบัญชีเจ้าหน้าที่"
                                onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
                        </div>
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={newStaff.password}
                                placeholder="กรอกรหัสผ่านบัญชีเจ้าหน้าที่"
                                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-3xl shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-[#000066]"
                            />
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
                                onClick={handleAddStaff}
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

export default SInfo;