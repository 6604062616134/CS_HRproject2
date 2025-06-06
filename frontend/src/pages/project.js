import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NavbarProject from '../components/navbar-project';
import NavbarPersonal from "../components/navbar-personal";

function Project() {
    const [students, setStudents] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // สำหรับช่องค้นหา
    const [searchTermYear, setSearchTermYear] = useState(''); // สำหรับดรอปดาวน์เลือกเทอม
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // สำหรับเปิด/ปิดดรอปดาวน์
    const [role, setRole] = useState('');
    const dropdownRef = useRef(null); // สำหรับดรอปดาวน์
    const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
    const [newYear, setNewYear] = useState('');
    const [yearOptions, setYearOptions] = useState([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState(null);
    const [isDeleteDropdownOpen, setIsDeleteDropdownOpen] = useState(false);

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

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/student/all',

                {
                    withCredentials: true,
                }
            );
            setStudents(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                window.location.href = '/'; // เปลี่ยนเส้นทางไปยังหน้าล็อกอิน
            } else {
                console.error('Error fetching data:', error);
            }
        }
    };

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getAllSemester', { withCredentials: true });
                setYearOptions(response.data.map(item => ({
                    id: item.y_ID, // เปลี่ยนเป็น y_ID ให้ตรงกับฐานข้อมูล
                    semester: item.semester
                })));
            } catch (error) {
                console.error('Error fetching semesters:', error);
            }
        };
        fetchSemesters();
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getUser', {
                    withCredentials: true,
                });
                setRole(response.data.role); // ตั้งค่า role จาก API
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false); // ปิดดรอปดาวน์
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredStudents = students.filter((student) => {
        const search = searchTerm.toLowerCase();
        const yearMatch = searchTermYear ? student.year === searchTermYear : true; // กรองตามปีการศึกษา
        return (
            yearMatch &&
            (
                student.thesisnameTH?.toLowerCase().includes(search) ||
                student.thesisnameEN?.toLowerCase().includes(search) ||
                student.FLname1?.toLowerCase().includes(search) ||
                student.FLname2?.toLowerCase().includes(search) ||
                student.studentCode1?.toLowerCase().includes(search) ||
                student.studentCode2?.toLowerCase().includes(search) ||
                student.chairman?.toLowerCase().includes(search) || // ค้นหาจากประธานกรรมการ
                student.director?.toLowerCase().includes(search) || // ค้นหาจากกรรมการ
                student.MainMentor?.toLowerCase().includes(search) || // ค้นหาจากอาจารย์ที่ปรึกษาหลัก
                student.CoMentor?.toLowerCase().includes(search) // ค้นหาจากอาจารย์ที่ปรึกษาร่วม
            )
        );
    });

    const handleEditModalOpen = (student) => {
        setEditData(student); // ตั้งค่าข้อมูลที่ต้องการแก้ไข
        setIsEditModalOpen(true); // เปิด Modal
    };

    const handleEditModalClose = () => {
        setEditData(null); // ล้างข้อมูลที่แก้ไข
        setIsEditModalOpen(false); // ปิด Modal
    };

    const handleDeleteStudent = async () => {
        const confirmDelete = window.confirm('คุณต้องการลบข้อมูลนักศึกษาทั้งหมดใช่หรือไม่?');
        if (!confirmDelete) {
            return; // หากผู้ใช้กด "ยกเลิก" ให้หยุดการทำงาน
        }

        try {
            await axios.delete(`http://localhost:8000/student/delete/${editData.thesisID}`,
                {
                    withCredentials: true,
                }
            );
            alert('ลบข้อมูลสำเร็จ');
            fetchData(); // โหลดข้อมูลใหม่
            handleEditModalClose(); // ปิด Modal
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddYear = async (e) => {
        e.preventDefault();
        if (!newYear.trim()) {
            alert('กรุณากรอกปีการศึกษา');
            return;
        }
        try {
            await axios.post('http://localhost:8000/user/createsemester', { semester: newYear.trim() }, { withCredentials: true });
            alert('เพิ่มปีการศึกษาสำเร็จ');
            // โหลดปีการศึกษาทั้งหมดใหม่
            const response = await axios.get('http://localhost:8000/user/getAllsemester', { withCredentials: true });
            setYearOptions(response.data.map(item => item.semester));
            setNewYear('');
            setIsAddYearModalOpen(false);
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert('ปีการศึกษานี้มีอยู่แล้ว');
            } else {
                alert('เกิดข้อผิดพลาดในการเพิ่มปีการศึกษา');
            }
        }
    };

    const NavbarComponent = role === "staff"
    ? NavbarPersonal
    : (props) => <NavbarProject {...props} fetchData={fetchData} />;

    return (
        <div className="flex flex-col h-screen">
            <NavbarComponent className="print:hidden" />
            <div className="flex flex-col p-4 mt-16 print:mt-0 flex-grow w-full">
                <div className="flex flex-row gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">รายชื่อนักศึกษาที่เข้าสอบโปรเจค</h2>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow px-4 py-2 border rounded-3xl text-xs focus:outline-none focus:ring-2 focus:ring-[#000066]"
                        />
                        <div className="flex items-center gap-4">
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    className="px-4 py-2 border rounded-3xl bg-white cursor-pointer focus:outline-none z-50 text-xs hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 ease-in-out flex items-center justify-between"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {searchTermYear || 'เลือกปีการศึกษา'}
                                    <span className={`ml-2 transform transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                                {isDropdownOpen && (
                                    <div
                                        className="absolute z-[9999] mt-2 w-64 max-h-64 overflow-y-auto bg-white border rounded-3xl"
                                        style={{ top: '100%' }}
                                    >
                                        <div
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                                            onClick={() => {
                                                setSearchTermYear('');
                                                setSelectedSemesterId(null);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            -
                                        </div>
                                        {yearOptions.map((term) => (
                                            <div
                                                key={term.id}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                                                onClick={() => {
                                                    setSearchTermYear(term.semester);
                                                    setSelectedSemesterId(term.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {term.semester}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {role !== 'teacher' && role !== 'staff' && (
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 underline hover:text-green-600"
                                    onClick={() => setIsAddYearModalOpen(true)}
                                >
                                    แก้ไขปีการศึกษา
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto flex-grow w-full">
                    <table className="w-full bg-white border border-gray-300 rounded-3xl print-cell">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="px-4 py-2 border text-xs max-w-[8px] min-w-[8px] break-words whitespace-normal">ลำดับ</th>
                                <th className="px-4 py-2 border text-xs max-w-[15px] min-w-[15px] break-words whitespace-normal">วันที่สอบ</th>
                                <th className="px-4 py-2 border text-xs max-w-[120px] min-w-[120px] break-words whitespace-normal">หัวข้อ</th>
                                <th className="px-4 py-2 border text-xs max-w-[38px] min-w-[38px] break-words whitespace-normal">รหัส</th>
                                <th className="px-4 py-2 border text-xs max-w-[80px] min-w-[80px] break-words whitespace-normal">ชื่อ-นามสกุล</th>
                                <th className="px-4 py-2 border text-xs max-w-[20px] min-w-[20px] rotate break-words whitespace-normal">ประธานกรรมการ</th>
                                <th className="px-4 py-2 border text-xs max-w-[20px] min-w-[20px] rotate break-words whitespace-normal">กรรมการ</th>
                                <th className="px-4 py-2 border text-xs max-w-[20px] min-w-[20px] rotate break-words whitespace-normal">อาจารย์ที่ปรึกษาหลัก</th>
                                <th className="px-4 py-2 border text-xs max-w-[20px] min-w-[20px] rotate break-words whitespace-normal">อาจารย์ที่ปรึกษาร่วม</th>
                                <th className="px-4 py-2 border text-xs max-w-[20px] min-w-[20px] rotate break-words whitespace-normal">ปีการศึกษา</th>
                                <th className="px-4 py-2 border text-xs max-w-[22px] min-w-[22px] rotate break-words whitespace-normal">ห้องสอบ</th>
                                <th className="px-4 py-2 border text-xs max-w-[10px] min-w-[10px] rotate break-words whitespace-normal">เกรดที่ได้</th>
                                <th className="px-4 py-2 border text-xs max-w-[18px] min-w-[18px] rotate break-words whitespace-normal">หมายเหตุ</th>
                                {role !== 'staff' && (
                                    <th className="px-4 py-2 border text-xs print:hidden max-w-[20px] min-w-[20px] break-words whitespace-normal">แก้ไข</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id || index}>
                                        <td className="px-4 py-2 border text-xs text-center max-w-[8px] min-w-[8px] break-words whitespace-normal">{index + 1}</td>
                                        <td className="px-4 py-2 border text-xs text-center max-w-[15px] min-w-[15px] break-words whitespace-normal">
                                            {new Date(student.datetime).toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-2 border text-xs break-words whitespace-normal max-w-[120px] min-w-[120px] break-words whitespace-normal">
                                            {student.thesisnameTH || student.thesisnameEN ? (
                                                <>
                                                    {student.thesisnameTH && <span>{student.thesisnameTH}</span>}
                                                    {student.thesisnameEN && student.thesisnameTH && <br />}
                                                    {student.thesisnameEN && <span>{student.thesisnameEN}</span>}
                                                </>
                                            ) : (
                                                <span>ไม่มีข้อมูล</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 border text-xs break-words whitespace-normal max-w-[38px] min-w-[38px] break-words whitespace-normal">
                                            {student.studentCode1}
                                            <br />
                                            {student.studentCode2}
                                        </td>
                                        <td className="px-2 py-2 border text-xs break-words whitespace-normal max-w-[80px] min-w-[80px] break-words whitespace-normal">
                                            {student.FLname1}
                                            <br />
                                            {student.FLname2}
                                        </td>
                                        <td className="px-2 py-2 border text-xs text-center max-w-[20px] min-w-[20px] break-words whitespace-normal">{student.chairman}</td>
                                        <td className="px-2 py-2 border text-xs text-center max-w-[20px] min-w-[20px] break-words whitespace-normal">{student.director}</td>
                                        <td className="px-2 py-2 border text-xs text-center max-w-[20px] min-w-[20px] break-words whitespace-normal">{student.MainMentor}</td>
                                        <td className="px-2 py-2 border text-xs text-center max-w-[20px] min-w-[20px] break-words whitespace-normal">{student.CoMentor}</td>
                                        <td className="px-2 py-2 border text-xs text-center max-w-[20px] min-w-[20px] break-words whitespace-normal">{student.year}</td>
                                        <td className="px-2 py-2 border text-xs text-center max-w-[22px] min-w-[22px] break-words whitespace-normal">{student.room}</td>
                                        <td className="px-2 py-2 border text-xs text-center max-w-[10px] min-w-[10px] break-words whitespace-normal">{student.grade}</td>
                                        <td className="px-2 py-2 border text-xs text-center max-w-[18px] min-w-[18px] break-words whitespace-normal">{student.note}</td>
                                        {role !== 'staff' && (
                                            <td className="px-2 py-2 border text-xs text-center print:hidden max-w-[0px] min-w-[20px]">
                                                {role === 'superadmin' && (
                                                    <button
                                                        className="px-2 py-1 bg-[#000066] text-white rounded-3xl z-50 hover:scale-105 hover:bg-white hover:text-black shadow-lg transition-transform duration-300"
                                                        onClick={() => handleEditModalOpen(student)}
                                                    >
                                                        แก้ไข
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="14" className="px-4 py-2 text-center text-xs text-gray-500">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {isEditModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-3xl shadow-lg w-[800px]">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold">แก้ไขข้อมูลนักศึกษา</h2>
                                    {role === 'superadmin' && (
                                        <button
                                            type="button"
                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-3xl hover:bg-red-600 no-print transition-transform duration-300 hover:scale-105"
                                            onClick={handleDeleteStudent}
                                        >
                                            ลบข้อมูล
                                        </button>
                                    )}
                                </div>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        try {
                                            await axios.put(`http://localhost:8000/student/update/${editData.thesisID}`, editData,
                                                {
                                                    withCredentials: true,
                                                }
                                            );
                                            alert('แก้ไขข้อมูลสำเร็จ');
                                            fetchData(); // โหลดข้อมูลใหม่
                                            handleEditModalClose(); // ปิด Modal
                                        } catch (error) {
                                            console.error('Error updating student data:', error);
                                            alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
                                        }
                                    }}
                                >
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สอบ</label>
                                            <input
                                                type="date"
                                                name="datetime"
                                                value={editData?.datetime || ''}
                                                onChange={(e) => setEditData({ ...editData, datetime: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา 1</label>
                                            <input
                                                type="text"
                                                name="studentCode1"
                                                value={editData?.studentCode1 || ''}
                                                placeholder='รหัสนักศึกษา 1'
                                                onChange={(e) => setEditData({ ...editData, studentCode1: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา 2</label>
                                            <input
                                                type="text"
                                                name="studentCode2"
                                                placeholder='รหัสนักศึกษา 2'
                                                value={editData?.studentCode2 || ''}
                                                onChange={(e) => setEditData({ ...editData, studentCode2: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-[2] min-w-[300px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (ไทย)</label>
                                            <input
                                                type="text"
                                                name="thesisnameTH"
                                                placeholder='ปริญญานิพนธ์เรื่อง (ไทย)'
                                                value={editData?.thesisnameTH || ''}
                                                onChange={(e) => setEditData({ ...editData, thesisnameTH: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-[2] min-w-[300px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (อังกฤษ)</label>
                                            <input
                                                type="text"
                                                name="thesisnameEN"
                                                placeholder='ปริญญานิพนธ์เรื่อง (อังกฤษ)'
                                                value={editData?.thesisnameEN || ''}
                                                onChange={(e) => setEditData({ ...editData, thesisnameEN: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-[2] min-w-[300px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (นักศึกษา 1)</label>
                                            <input
                                                type="text"
                                                name="FLname1"
                                                value={editData?.FLname1 || ''}
                                                placeholder='ชื่อ-นามสกุล (นักศึกษา 1)'
                                                onChange={(e) => setEditData({ ...editData, FLname1: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-[2] min-w-[300px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (นักศึกษา 2)</label>
                                            <input
                                                type="text"
                                                name="FLname2"
                                                value={editData?.FLname2 || ''}
                                                placeholder='ชื่อ-นามสกุล (นักศึกษา 2)'
                                                onChange={(e) => setEditData({ ...editData, FLname2: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ประธานกรรมการ</label>
                                            <input
                                                type="text"
                                                name="chairman"
                                                value={editData?.chairman || ''}
                                                placeholder='ประธานกรรมการ'
                                                onChange={(e) => setEditData({ ...editData, chairman: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">กรรมการ</label>
                                            <input
                                                type="text"
                                                name="director"
                                                value={editData?.director || ''}
                                                placeholder='กรรมการ'
                                                onChange={(e) => setEditData({ ...editData, director: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษาหลัก</label>
                                            <input
                                                type="text"
                                                name="MainMentor"
                                                value={editData?.MainMentor || ''}
                                                placeholder='อาจารย์ที่ปรึกษาหลัก'
                                                onChange={(e) => setEditData({ ...editData, MainMentor: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษาร่วม</label>
                                            <input
                                                type="text"
                                                name="CoMentor"
                                                value={editData?.CoMentor || ''}
                                                placeholder='อาจารย์ที่ปรึกษาร่วม'
                                                onChange={(e) => setEditData({ ...editData, CoMentor: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                                            <input
                                                type="text"
                                                name="year"
                                                value={editData?.year || ''}
                                                placeholder='ปีการศึกษา'
                                                onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ห้องสอบ</label>
                                            <input
                                                type="text"
                                                name="room"
                                                value={editData?.room || ''}
                                                placeholder='ห้องสอบ'
                                                onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">เกรดที่ได้</label>
                                            <input
                                                type="text"
                                                name="grade"
                                                value={editData?.grade || ''}
                                                placeholder='เกรดที่ได้'
                                                onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-[2] min-w-[300px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                                            <textarea
                                                name="note"
                                                value={editData?.note || ''}
                                                placeholder='หมายเหตุ'
                                                onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-300 rounded-3xl shadow-lg hover:bg-red-600 hover:scale-105 hover:text-white transition-transform duration-300"
                                            onClick={handleEditModalClose}
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-[#000066] text-white shadow-lg rounded-3xl hover:bg-green-600 hover:scale-105 transition-transform duration-300"
                                        >
                                            บันทึก
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isAddYearModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setIsAddYearModalOpen(false)}
                >
                    <div
                        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            เพิ่มปีการศึกษา
                        </h3>

                        <form onSubmit={handleAddYear}>
                            <input
                                type="text"
                                value={newYear}
                                onChange={e => setNewYear(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-3xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#000066] transition" // เปลี่ยน rounded-xl → rounded-3xl
                                placeholder="เช่น 1/2571"
                                required
                            />
                            <div className="flex justify-end gap-2 mb-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-3xl hover:bg-red-500 hover:text-white transition" // เปลี่ยน rounded-xl → rounded-3xl
                                    onClick={() => setIsAddYearModalOpen(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-[#000066] text-white rounded-3xl hover:bg-green-600 transition" // เปลี่ยน rounded-xl → rounded-3xl
                                >
                                    เพิ่ม
                                </button>
                            </div>
                        </form>

                        <hr className="my-4" />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ลบปีการศึกษา
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1" ref={dropdownRef}>
                                    <div
                                        className="px-4 py-2 border rounded-3xl bg-white cursor-pointer focus:outline-none z-50 text-sm hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 ease-in-out flex items-center justify-between"
                                        onClick={() => setIsDeleteDropdownOpen(!isDeleteDropdownOpen)}
                                    >
                                        {yearOptions.find(y => y.id === selectedSemesterId)?.semester || 'เลือกปีการศึกษาที่ต้องการลบ'}
                                        <span className={`ml-2 transform transition-transform duration-300 ease-in-out ${isDeleteDropdownOpen ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                    {isDeleteDropdownOpen && (
                                        <div
                                            className="absolute z-[9999] mt-2 w-full max-h-48 overflow-y-auto bg-white border rounded-3xl shadow-lg"
                                            style={{ top: '100%' }}
                                        >
                                            <div
                                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 cursor-pointer text-sm transition-all duration-300 ease-in-out"
                                                onClick={() => {
                                                    setSelectedSemesterId(null);
                                                    setIsDeleteDropdownOpen(false);
                                                }}
                                            >
                                                - ไม่มีปีการศึกษา -
                                            </div>
                                            {yearOptions.map((term) => (
                                                <div
                                                    key={term.id}
                                                    className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-sm text-gray-700 transition-all duration-300 ease-in-out"
                                                    onClick={() => {
                                                        setSelectedSemesterId(term.id);
                                                        setIsDeleteDropdownOpen(false);
                                                    }}
                                                >
                                                    {term.semester}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-3xl hover:bg-red-700 transition"
                                    disabled={!selectedSemesterId}
                                    onClick={async () => {
                                        if (!selectedSemesterId) return;
                                        const selectedTerm = yearOptions.find(
                                            t => String(t.id) === String(selectedSemesterId)
                                        );
                                        const confirmDelete = window.confirm(
                                            `ต้องการลบปีการศึกษา "${selectedTerm?.semester || ''}" หรือไม่?`
                                        );
                                        if (!confirmDelete) return;
                                        try {
                                            await axios.delete(`http://localhost:8000/user/deleteSemester/${selectedSemesterId}`, { withCredentials: true });
                                            alert('ลบปีการศึกษาสำเร็จ');
                                            const response = await axios.get('http://localhost:8000/user/getAllSemester', { withCredentials: true });
                                            setYearOptions(response.data.map(item => ({
                                                id: item.y_ID,
                                                semester: item.semester
                                            })));
                                            setSelectedSemesterId(null);
                                            setSearchTermYear('');
                                        } catch (error) {
                                            alert('เกิดข้อผิดพลาดในการลบปีการศึกษา');
                                        }
                                    }}
                                >
                                    ลบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Project;