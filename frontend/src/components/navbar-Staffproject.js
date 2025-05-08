import { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function NavbarStaffProject() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTeacherListOpen, setIsTeacherListOpen] = useState(false);
    const [isStaffListOpen, setIsStaffListOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [formData, setFormData] = useState({
        thesisNameTH: '',
        thesisNameEN: '',
        studentCode1: '',
        studentCode2: '',
        FLname1: '',
        FLname2: '',
        MainMentor: '',
        year: '',
        note: '',
        checked: '',
        s_name: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

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

    const fetchData = async () => {
        try {
            const responseTeachers = await axios.get('http://localhost:8000/teacher/',
                {
                    withCredentials: true,
                }
            );
            setTeachers(responseTeachers.data);

            const responseStaff = await axios.get('http://localhost:8000/staff/',
                {
                    withCredentials: true,
                }
            );
            setStaff(responseStaff.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ตรวจสอบว่ามีการกรอกข้อมูลในฟิลด์ที่จำเป็นหรือไม่
        if (!formData.MainMentor || !formData.MainMentor.trim() || !formData.s_name || !formData.s_name.trim()) {
            alert('กรุณากรอกข้อมูลอาจารย์ที่ปรึกษาและเจ้าหน้าที่');
            return;
        }

        // เตรียมข้อมูลที่จะส่งไปยัง Backend
        const payload = {
            thesisNameTH: formData.thesisNameTH.trim(),
            thesisNameEN: formData.thesisNameEN.trim(),
            studentCode1: formData.studentCode1.trim(),
            studentCode2: formData.studentCode2.trim(),
            FLname1: formData.FLname1.trim(),
            FLname2: formData.FLname2.trim(),
            MainMentor: formData.MainMentor.trim(),
            year: formData.year.trim(),
            note: formData.note.trim(),
            checked: formData.checked === "true" ? 1 : 0,
            s_name: formData.s_name.trim(),
        };

        try {
            const response = await axios.post('http://localhost:8000/staffproject/create', payload,
                {
                    withCredentials: true,
                }
            );
            if (response.status === 201) {
                alert('บันทึกข้อมูลสำเร็จ');
                setIsModalOpen(false); // ปิด modal
                window.location.reload(); // รีเฟรชหน้าเว็บ
            }
        } catch (error) {
            console.error('Error creating staff project:', error);
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
                    <div className="flex items-center justify-end gap-4">
                        <div className="text-white text-sm font-light">
                            {loggedInUser ? `สวัสดี, ${loggedInUser.username}` : 'กำลังโหลด...'}
                        </div>

                        {role === 'superadmin' && (
                            <button
                                className="px-3 py-1 bg-white text-xs text-black rounded-3xl shadow-lg hover:bg-green-600 hover:scale-105 hover:text-white transition-all duration-300 ease-in-out"
                                onClick={handleModalToggle}
                            >
                                เพิ่มข้อมูล
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
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-[90%] max-w-[800px] overflow-auto">
                        <h2 className="text-lg font-bold mb-4 no-print">เพิ่มข้อมูลโปรเจค</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-wrap gap-4">
                                {/* ปริญญานิพนธ์เรื่อง (ไทย) */}
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (ไทย)</label>
                                    <input
                                        type="text"
                                        name="thesisNameTH"
                                        value={formData.thesisNameTH}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ชื่อปริญญานิพนธ์ (ไทย)"
                                    />
                                </div>

                                {/* ปริญญานิพนธ์เรื่อง (อังกฤษ) */}
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (อังกฤษ)</label>
                                    <input
                                        type="text"
                                        name="thesisNameEN"
                                        value={formData.thesisNameEN}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ชื่อปริญญานิพนธ์ (อังกฤษ)"
                                    />
                                </div>

                                {/* รหัสนักศึกษา 1 */}
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

                                {/* รหัสนักศึกษา 2 */}
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

                                {/* ปีการศึกษา */}
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

                                {/* ชื่อ-นามสกุล (นักศึกษา) 1 */}
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (นักศึกษา) 1</label>
                                    <input
                                        type="text"
                                        name="FLname1"
                                        value={formData.FLname1}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ชื่อ-นามสกุล (นักศึกษา)1"
                                    />
                                </div>

                                {/* ชื่อ-นามสกุล (นักศึกษา) 2 */}
                                <div className="flex-[2] min-w-[300px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (นักศึกษา) 2</label>
                                    <input
                                        type="text"
                                        name="FLname2"
                                        value={formData.FLname2}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="ชื่อ-นามสกุล (นักศึกษา)2"
                                    />
                                </div>


                                {/* สถานะการตรวจสอบ และ อาจารย์ที่ปรึกษา */}
                                <div className="flex w-full gap-4">
                                    {/* สถานะการตรวจสอบ */}
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">สถานะการตรวจสอบ</label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="checked"
                                                    value="true"
                                                    checked={formData.checked === "true"}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                ตรวจแล้ว
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="checked"
                                                    value="false"
                                                    checked={formData.checked === "false"}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                ยังไม่ตรวจ
                                            </label>
                                        </div>
                                    </div>
                                    {/* อาจารย์ที่ปรึกษา */}
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษา</label>
                                        <input
                                            type="text"
                                            name="MainMentor"
                                            value={formData.MainMentor}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            placeholder="รหัสอาจารย์ที่ปรึกษา"
                                        />
                                    </div>

                                    {/* เจ้าหน้าที่ */}
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">เจ้าหน้าที่</label>
                                        <input
                                            type="text"
                                            name="s_name"
                                            value={formData.s_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            placeholder="ชื่อเจ้าหน้าที่"
                                        />
                                    </div>
                                </div>
                                {/* หมายเหตุ */}
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="หมายเหตุ"
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded-3xl hover:text-white hover:bg-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
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
                        <div>
                            {/* <NavLink
                                to="/admin"
                                className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                                onClick={handleToggle}
                                >
                                    จัดการผู้ใช้
                            </NavLink> */}
                            <NavLink
                                to="/tInfo"
                                className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                                onClick={handleToggle}
                            >
                                ข้อมูลอาจารย์
                            </NavLink>
                            <NavLink
                                to="/sInfo"
                                className="block py-2 px-4 text-white hover:bg-white hover:text-black rounded-3xl"
                                onClick={handleToggle}
                            >
                                ข้อมูลเจ้าหน้าที่
                            </NavLink>
                        </div>
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
                                    onClick={() => {
                                        handleToggle(); // ปิดเมนู
                                        navigate(`/detail/teacher/${teacher.t_ID}`);
                                        window.location.reload(); // รีโหลดหน้าเพื่อโหลดข้อมูลใหม่
                                    }}
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
                                    onClick={() => {
                                        handleToggle(); // ปิดเมนู
                                        navigate(`/detail/staff/${staffMember.s_ID}`);
                                        window.location.reload(); // รีโหลดหน้า
                                    }}
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

export default NavbarStaffProject;