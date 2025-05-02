import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function NavbarProject({ fetchData }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTeacherListOpen, setIsTeacherListOpen] = useState(false);
    const [isStaffListOpen, setIsStaffListOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        datetime: '',
        thesisnameTH: '',
        thesisnameEN: '',
        studentCode1: '',
        studentCode2: '',
        FLname1: '',
        FLname2: '',
        chairman: '',
        director: '',
        MainMentor: '',
        CoMentor: '',
        year: '',
        room: '',
        grade: '',
        note: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันการรีเฟรชหน้า

        // ตรวจสอบว่ามีการกรอกข้อมูลในฟิลด์ใดฟิลด์หนึ่งหรือไม่
        const isFormEmpty = Object.values(formData).every((value) => value.trim() === '');
        if (isFormEmpty) {
            alert('กรุณากรอกข้อมูลอย่างน้อย 1 ช่อง');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/student/create', formData,
                {
                    withCredentials: true,
                }
            );
            if (response.status === 200) {
                alert('บันทึกข้อมูลสำเร็จ');
                fetchData(); // โหลดข้อมูลใหม่
                handleModalToggle(); // ปิด Modal อัตโนมัติ
                setFormData({
                    datetime: '',
                    thesisnameTH: '',
                    thesisnameEN: '',
                    studentCode1: '',
                    studentCode2: '',
                    FLname1: '',
                    FLname2: '',
                    chairman: '',
                    director: '',
                    MainMentor: '',
                    CoMentor: '',
                    year: '',
                    room: '',
                    grade: '',
                    note: '',
                }); // เคลียร์ข้อมูลในฟอร์ม
            }
        } catch (error) {
            console.error('Error creating student thesis info:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getUser', {
                    withCredentials: true,
                });
                setRole(response.data.role); // เข้าถึง role ได้โดยตรง
                console.log('User role:', response.data.role);
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/teacher/',
                    {
                        withCredentials: true,
                    }
                );
                setTeachers(response.data);
            } catch (error) {
                console.error('Error fetching teachers:', error);
            }
        };

        const fetchStaff = async () => {
            try {
                const response = await axios.get('http://localhost:8000/staff/',
                    {
                        withCredentials: true,
                    }
                );
                setStaff(response.data);
            } catch (error) {
                console.error('Error fetching staff:', error);
            }
        };

        fetchTeachers();
        fetchStaff();
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

    const handleToggle = () => {
        setIsMenuOpen(!isMenuOpen); // สลับสถานะเปิด/ปิดเมนูหลัก
    };

    const handleTeacherToggle = () => {
        setIsTeacherListOpen(!isTeacherListOpen); // สลับสถานะเปิด/ปิดรายชื่ออาจารย์
    };

    const handleStaffToggle = () => {
        setIsStaffListOpen(!isStaffListOpen); // สลับสถานะเปิด/ปิดรายชื่อเจ้าหน้าที่
    };

    const handleModalToggle = () => {
        setIsModalOpen((prev) => !prev);
    };

    return (
        <div>
            <nav className="bg-[#000066] p-4 fixed top-0 left-0 w-full z-50 print:hidden">
                <div className="flex items-center justify-between px-4 lg:px-8">
                    {/* ปุ่ม ☰ หรือ ✕ */}
                    <div className="flex items-center gap-4">
                        <button onClick={handleToggle} className="text-white text-xl z-10">
                            {isMenuOpen ? '✕' : '☰'}
                        </button>
                        <div className="text-white text-lg font-bold">
                            HR-CS {role === 'superadmin' && (
                                <span className="text-yellow-400 text-sm font-light">
                                    (super admin)
                                </span>
                            )}
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        {role === 'superadmin' && (
                            <button
                                className="px-3 py-1 bg-white text-xs text-black rounded-3xl shadow-lg hover:bg-green-600 hover:scale-105 hover:text-white transition-all duration-300 ease-in-out"
                                onClick={handleModalToggle}
                            >
                                เพิ่มข้อมูลนักศึกษา
                            </button>
                        )}
                        <button
                            className="text-white underline text-xs hover:text-red-600 transition-all duration-300 ease-in-out"
                            onClick={handleLogout}
                        >
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </nav>
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-[800px]">
                        <div className="text-md font-bold mb-4 no-print">เพิ่มข้อมูลนักศึกษา</div>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สอบ</label>
                                    <input
                                        type="date"
                                        name="datetime"
                                        value={formData.datetime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา 1</label>
                                    <input
                                        type="text"
                                        name="studentCode1"
                                        value={formData.studentCode1}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="รหัสนักศึกษา 1"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา 2</label>
                                    <input
                                        type="text"
                                        name="studentCode2"
                                        value={formData.studentCode2}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="รหัสนักศึกษา 2"
                                    />
                                </div>
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (ไทย)</label>
                                    <input
                                        type="text"
                                        name="thesisnameTH"
                                        value={formData.thesisnameTH}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ชื่อปริญญานิพนธ์ (ไทย)"
                                    />
                                </div>
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (อังกฤษ)</label>
                                    <input
                                        type="text"
                                        name="thesisnameEN"
                                        value={formData.thesisnameEN}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ชื่อปริญญานิพนธ์ (อังกฤษ)"
                                    />
                                </div>
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (นักศึกษา 1)</label>
                                    <input
                                        type="text"
                                        name="FLname1"
                                        value={formData.FLname1}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ชื่อ-นามสกุล (นักศึกษา 1)"
                                    />
                                </div>
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (นักศึกษา 2)</label>
                                    <input
                                        type="text"
                                        name="FLname2"
                                        value={formData.FLname2}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ชื่อ-นามสกุล (นักศึกษา 2)"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ประธานกรรมการ</label>
                                    <input
                                        type="text"
                                        name="chairman"
                                        value={formData.chairman}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ประธานกรรมการ"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">กรรมการ</label>
                                    <input
                                        type="text"
                                        name="director"
                                        value={formData.director}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="กรรมการ"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษาหลัก</label>
                                    <input
                                        type="text"
                                        name="MainMentor"
                                        value={formData.MainMentor}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="อาจารย์ที่ปรึกษาหลัก"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษาร่วม</label>
                                    <input
                                        type="text"
                                        name="CoMentor"
                                        value={formData.CoMentor}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="อาจารย์ที่ปรึกษาร่วม"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                                    <input
                                        type="text"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ปีการศึกษา"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ห้องสอบ</label>
                                    <input
                                        type="text"
                                        name="room"
                                        value={formData.room}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ห้องสอบ"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เกรดที่ได้</label>
                                    <input
                                        type="text"
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="เกรดที่ได้"
                                    />
                                </div>
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="หมายเหตุ"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded-3xl hover:bg-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                    onClick={handleModalToggle}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#000066] text-white rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ไซด์บาร์ */}
            <div
                className={`fixed top-0 left-0 h-full bg-[#000066] text-white transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } transition-transform duration-300 ease-in-out z-40 overflow-y-auto`}
                style={{ width: '304px' }}
            >
                <button
                    onClick={handleToggle}
                    className="text-white text-xl absolute top-4 right-4"
                >
                    ✕
                </button>
                <div className="p-4 mt-4">
                    <h2 className="text-lg font-bold mb-4">เมนู</h2>
                    {role === 'superadmin' && (
                        <NavLink
                            to="/assign"
                            className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                            onClick={handleToggle}
                        >
                            กิจกรรมบุคลากร
                        </NavLink>
                    )}
                    <NavLink
                        to="/project"
                        className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                        onClick={handleToggle}
                    >
                        สอบโปรเจค
                    </NavLink>
                    <NavLink
                        to="/staffProject"
                        className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                        onClick={handleToggle}>
                        ตรวจโปรเจค(เจ้าหน้าที่)
                    </NavLink>
                    {/* แสดงเฉพาะเมื่อ role เป็น superadmin */}
                    {role === 'superadmin' && (
                        <NavLink
                            to="/admin"
                            className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                            onClick={handleToggle}
                        >
                            จัดการผู้ใช้
                        </NavLink>
                    )}
                    <hr className="my-4 border-t border-1 border-gray-300 w-64 mx-auto" />
                    <button
                        onClick={handleTeacherToggle}
                        className="w-full flex justify-between items-center px-4 py-2 text-white font-bold hover:bg-white hover:text-black rounded-3xl"
                    >
                        อาจารย์
                        <span className={`transform transition-transform ${isTeacherListOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>
                    {/* รายชื่ออาจารย์ */}
                    {isTeacherListOpen && (
                        <div className="ml-4 mt-2 max-h-64 overflow-y-auto scrollbar-custom">
                            {teachers.map((teacher) => (
                                <NavLink
                                    key={teacher.t_ID}
                                    to={`/detail/teacher/${teacher.t_ID}`} // ส่ง type "teacher" และ id
                                    className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                                    onClick={handleToggle}
                                >
                                    {teacher.t_name}
                                </NavLink>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={handleStaffToggle}
                        className="w-full flex justify-between items-center px-4 py-2 text-white font-bold hover:bg-white hover:text-black rounded-3xl"
                    >
                        เจ้าหน้าที่
                        <span className={`transform transition-transform ${isStaffListOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>
                    {/* รายชื่อเจ้าหน้าที่ */}
                    {isStaffListOpen && (
                        <div className="ml-4 mt-2 max-h-64 overflow-y-auto scrollbar-custom">
                            {staff.map((staffMember) => (
                                <NavLink
                                    key={staffMember.s_ID}
                                    to={`/detail/staff/${staffMember.s_ID}`} // ส่ง type "staff" และ id
                                    className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                                    onClick={handleToggle}
                                >
                                    {staffMember.s_name}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NavbarProject;