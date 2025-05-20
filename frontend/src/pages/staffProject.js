import { useState, useEffect, useRef } from 'react';
import NavbarStaffProject from "../components/navbar-Staffproject";
import NavbarPersonal from "../components/navbar-personal";
import axios from 'axios';

function StaffProject() {
    const [data, setData] = useState([]); // เก็บข้อมูลจาก API
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // สำหรับเปิด/ปิด modal
    const [editData, setEditData] = useState(null); // เก็บข้อมูลของแถวที่ต้องการแก้ไข
    const [searchTerm, setSearchTerm] = useState(''); // เก็บคำค้นหา
    const [searchTermYear, setSearchTermYear] = useState(''); // เก็บค่าปีการศึกษาที่เลือก
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // สำหรับเปิด/ปิดดรอปดาวน์
    const dropdownRef = useRef(null); // สำหรับดรอปดาวน์
    const [role, setRole] = useState(''); // เก็บข้อมูล role ของผู้ใช้
    const [yearOptions, setYearOptions] = useState([]);
    const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
    const [newYear, setNewYear] = useState('');
    const [isDeleteDropdownOpen, setIsDeleteDropdownOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);

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
        const fetchSemesters = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getAllSemester');
                setYearOptions(response.data.map(item => ({
                    id: item.y_ID,
                    semester: item.semester
                })));
            } catch (error) {
                console.error('Error fetching semesters:', error);
            }
        };
        fetchSemesters();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/staffproject/getall',
                    {
                        withCredentials: true, // ย้ายมาไว้ที่นี่
                    }
                );
                setData(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchData();
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

    const handleEditClick = (item) => {
        console.log('Selected item:', item); // ตรวจสอบข้อมูลที่เลือก
        setEditData({
            ...item,
            checked: item.checked !== null && item.checked !== undefined ? item.checked : 0, // ตั้งค่า default เป็น 0
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const response = await axios.post(
                `http://localhost:8000/staffproject/update/${editData.sp_ID}`,
                editData, // ข้อมูลที่ต้องการส่งไปยัง Backend
                {
                    withCredentials: true, // ส่ง Cookies ไปพร้อมคำขอ
                }
            );
            if (response.status === 200) {
                alert('แก้ไขข้อมูลสำเร็จ');
                setIsEditModalOpen(false); // ปิด modal
                window.location.reload(); // รีเฟรชหน้าเว็บเพื่อโหลดข้อมูลใหม่
            }
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
            const response = await axios.get('http://localhost:8000/user/getAllSemester', { withCredentials: true });
            setYearOptions(response.data.map(item => ({
                id: item.y_ID,
                semester: item.semester
            })));
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

    const handleDeleteYear = async () => {
        if (!selectedSemester) return;
        const selectedTerm = yearOptions.find(t => String(t.id) === String(selectedSemester));
        const confirmDelete = window.confirm(
            `ต้องการลบปีการศึกษา "${selectedTerm?.semester || ''}" หรือไม่?`
        );
        if (!confirmDelete) return;
        try {
            await axios.delete(`http://localhost:8000/user/deleteSemester/${selectedSemester}`, { withCredentials: true });
            alert('ลบปีการศึกษาสำเร็จ');
            const response = await axios.get('http://localhost:8000/user/getAllSemester', { withCredentials: true });
            setYearOptions(response.data.map(item => ({
                id: item.y_ID,
                semester: item.semester
            })));
            setSelectedSemester(null);
            setIsDeleteDropdownOpen(false);
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการลบปีการศึกษา');
        }
    };

    const filteredData = data.filter((item) => {
        const search = searchTerm.toLowerCase();
        const yearMatch = searchTermYear ? item.year === searchTermYear : true; // กรองตามปีการศึกษา
        return (
            yearMatch && // ตรวจสอบว่าตรงกับปีการศึกษาที่เลือก
            (
                item.thesisNameTH?.toLowerCase().includes(search) || // ชื่อโปรเจค (ไทย)
                item.thesisNameEN?.toLowerCase().includes(search) || // ชื่อโปรเจค (อังกฤษ)
                item.teacherName?.toLowerCase().includes(search) || // ชื่ออาจารย์
                item.staffName?.toLowerCase().includes(search) || // ชื่อเจ้าหน้าที่
                item.studentName1?.toLowerCase().includes(search) || // ชื่อนักศึกษา 1
                item.studentName2?.toLowerCase().includes(search) || // ชื่อนักศึกษา 2
                item.studentID_1?.toLowerCase().includes(search) || // รหัสนักศึกษา 1
                item.studentID_2?.toLowerCase().includes(search) // รหัสนักศึกษา 2
            )
        );
    });

    const NavbarComponent = role === "staff" ? NavbarPersonal : NavbarStaffProject;

    return (
        <div className="container mx-auto w-full px-4 py-20">
            <NavbarComponent className="print:hidden" />
            <div className="flex items-center gap-4 mb-4">
                <h1 className="text-xl ml-8 font-bold">ตารางการตรวจโปรเจคสำหรับเจ้าหน้าที่</h1>
                <div className="flex items-center gap-4">
                    <div className="relative flex-grow print:hidden">
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border text-xs rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                        />
                    </div>
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
                                    {/* ตัวเลือกค่าว่าง */}
                                    <div
                                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                                        onClick={() => {
                                            setSearchTermYear('');
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        -
                                    </div>
                                    {/* ตัวเลือกปีการศึกษาจาก state */}
                                    {yearOptions.map((term) => (
                                        <div
                                            key={term.id}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                                            onClick={() => {
                                                setSearchTermYear(term.semester);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {term.semester}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {role !== 'staff' && (
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
            {/* ตารางแสดงข้อมูล */}
            <div className="overflow-x-auto flex-grow w-full">
                <div className="w-full px-2 md:px-8">
                    <table className="w-full bg-white border border-gray-300 rounded-3xl print-cell">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="px-2 py-2 border text-xs min-w-[40px] max-w-[40px] break-words whitespace-normal">ลำดับ</th>
                                <th className="px-2 py-2 border text-xs min-w-[80px] max-w-[100px] break-words whitespace-normal">รหัสนักศึกษา</th>
                                <th className="px-2 py-2 border text-xs min-w-[100px] max-w-[140px] break-words whitespace-normal">ชื่อนักศึกษา</th>
                                <th className="px-2 py-2 border text-xs min-w-[140px] max-w-[200px] break-words whitespace-normal">ปริญญานิพนธ์เรื่อง</th>
                                <th className="px-2 py-2 border text-xs min-w-[70px] max-w-[90px] break-words whitespace-normal">ปีการศึกษา</th>
                                <th className="px-2 py-2 border text-xs min-w-[90px] max-w-[120px] break-words whitespace-normal">อาจารย์ที่ปรึกษา</th>
                                <th className="px-2 py-2 border text-xs min-w-[90px] max-w-[120px] break-words whitespace-normal">เจ้าหน้าที่</th>
                                <th className="px-2 py-2 border text-xs min-w-[90px] max-w-[120px] break-words whitespace-normal">สถานะการตรวจ</th>
                                <th className="px-2 py-2 border text-xs min-w-[80px] max-w-[120px] break-words whitespace-normal">หมายเหตุ</th>
                                {/* เฉพาะถ้าไม่ใช่ staff เท่านั้น */}
                                {role !== 'staff' && (
                                    <th className="px-2 py-2 border text-xs print:hidden min-w-[60px] max-w-[80px] break-words whitespace-normal">แก้ไข</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr key={index} className="text-center">
                                        <td className="px-2 py-2 border text-xs min-w-[40px] max-w-[40px]">{index + 1}</td>
                                        <td className="px-2 py-2 border text-xs min-w-[80px] max-w-[100px] break-words whitespace-normal">
                                            {item.studentID_1 || '-'} <br /> {item.studentID_2 || '-'}
                                        </td>
                                        <td className="px-2 py-2 border text-xs min-w-[100px] max-w-[140px] break-words whitespace-normal">
                                            {item.studentName1 || '-'} <br /> {item.studentName2 || '-'}
                                        </td>
                                        <td className="px-2 py-2 border text-xs min-w-[140px] max-w-[200px] break-words whitespace-normal">
                                            {item.thesisNameTH || '-'} <br /> {item.thesisNameEN || '-'}
                                        </td>
                                        <td className="px-2 py-2 border text-xs min-w-[70px] max-w-[90px] break-words whitespace-normal">{item.year || '-'}</td>
                                        <td className="px-2 py-2 border text-xs min-w-[90px] max-w-[120px] break-words whitespace-normal">{item.teacherName || '-'}</td>
                                        <td className="px-2 py-2 border text-xs min-w-[90px] max-w-[120px] break-words whitespace-normal">{item.staffName || '-'}</td>
                                        <td className="px-2 py-2 border text-xs min-w-[90px] max-w-[120px] break-words whitespace-normal">
                                            {item.checked === 1
                                                ? 'ตรวจแล้ว'
                                                : item.checked === 2
                                                    ? 'กำลังตรวจ'
                                                    : 'ยังไม่ตรวจ'}
                                        </td>
                                        <td className="px-2 py-2 border text-xs min-w-[80px] max-w-[120px] break-words whitespace-normal">
                                            {item.note || '-'}
                                        </td>
                                        {/* เฉพาะถ้าไม่ใช่ staff เท่านั้น */}
                                        {role !== 'staff' && (
                                            <td className="px-2 py-2 border text-xs print:hidden min-w-[60px] max-w-[80px] break-words whitespace-normal">
                                                {role === 'superadmin' && (
                                                    <button
                                                        className="px-2 py-1 bg-[#000066] text-white rounded-3xl z-50 hover:scale-105 hover:bg-white hover:text-black shadow-lg transition-transform duration-300"
                                                        onClick={() => handleEditClick(item)}
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
                                    <td colSpan={role !== 'staff' ? 10 : 9} className="px-4 py-2 border text-center text-xs text-gray-500">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-[90%] max-w-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">แก้ไขข้อมูล</h2>
                            <button
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded-3xl hover:bg-gray-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                onClick={async () => {
                                    if (window.confirm('คุณต้องการลบข้อมูลนี้หรือไม่?')) {
                                        try {
                                            await axios.delete(`http://localhost:8000/staffproject/delete/${editData.sp_ID}`,
                                                {
                                                    withCredentials: true,
                                                }
                                            );
                                            alert('ลบข้อมูลสำเร็จ');
                                            setIsEditModalOpen(false);
                                            window.location.reload();
                                        } catch (error) {
                                            console.error('Error deleting data:', error);
                                            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
                                        }
                                    }
                                }}
                            >
                                ลบข้อมูล
                            </button>
                        </div>
                        <form>
                            <div className="flex flex-wrap gap-4">
                                {/* ชื่อโปรเจค (ไทย) */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (ไทย)</label>
                                    <input
                                        type="text"
                                        name="thesisNameTH"
                                        value={editData?.thesisNameTH || ''}
                                        onChange={(e) => setEditData({ ...editData, thesisNameTH: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>

                                {/* ชื่อโปรเจค (อังกฤษ) */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (อังกฤษ)</label>
                                    <input
                                        type="text"
                                        name="thesisNameEN"
                                        value={editData?.thesisNameEN || ''}
                                        onChange={(e) => setEditData({ ...editData, thesisNameEN: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>

                                {/* ชื่อนักศึกษา 1 */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อนักศึกษา 1</label>
                                    <input
                                        type="text"
                                        name="studentName1"
                                        value={editData?.studentName1 || ''}
                                        onChange={(e) => setEditData({ ...editData, studentName1: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>

                                {/* ชื่อนักศึกษา 2 */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อนักศึกษา 2</label>
                                    <input
                                        type="text"
                                        name="studentName2"
                                        value={editData?.studentName2 || ''}
                                        onChange={(e) => setEditData({ ...editData, studentName2: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>

                                {/* รหัสนักศึกษา 1 */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา 1</label>
                                    <input
                                        type="text"
                                        name="studentID_1"
                                        value={editData?.studentID_1 || ''}
                                        onChange={(e) => setEditData({ ...editData, studentID_1: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>

                                {/* รหัสนักศึกษา 2 */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา 2</label>
                                    <input
                                        type="text"
                                        name="studentID_2"
                                        value={editData?.studentID_2 || ''}
                                        onChange={(e) => setEditData({ ...editData, studentID_2: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>

                                {/* ปีการศึกษา */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                                    <input
                                        type="text"
                                        name="year"
                                        value={editData?.year || ''}
                                        onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        placeholder="เช่น 2/2567"
                                    />
                                </div>

                                {/* อาจารย์ */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์</label>
                                    <input
                                        type="text"
                                        name="teacherName"
                                        value={editData?.teacherName || ''}
                                        onChange={(e) => setEditData({ ...editData, teacherName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>

                                {/* เจ้าหน้าที่ */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เจ้าหน้าที่</label>
                                    <input
                                        type="text"
                                        name="staffName"
                                        value={editData?.staffName || ''}
                                        onChange={(e) => setEditData({ ...editData, staffName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    />
                                </div>
                            </div>

                            {/* หมายเหตุ */}
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                                    <textarea
                                        name="note"
                                        value={editData?.note || ''}
                                        onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        rows="3"
                                    />
                                </div>
                                {/* สถานะการตรวจสอบ */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">สถานะการตรวจสอบ</label>
                                    <div className="flex items-center gap-4 text-xs mt-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="checked"
                                                value="1"
                                                checked={editData?.checked === 1} // ตรวจสอบว่าค่า checked เป็น 1
                                                onChange={() => setEditData({ ...editData, checked: 1 })}
                                            />
                                            ตรวจแล้ว
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="checked"
                                                value="2"
                                                checked={editData?.checked === 2} // ตรวจสอบว่าค่า checked เป็น 2
                                                onChange={() => setEditData({ ...editData, checked: 2 })}
                                            />
                                            กำลังตรวจ
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="checked"
                                                value="0"
                                                checked={editData?.checked === 0} // ตรวจสอบว่าค่า checked เป็น 0
                                                onChange={() => setEditData({ ...editData, checked: 0 })}
                                            />
                                            ยังไม่ตรวจ
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded-3xl hover:bg-red-600 hover:text-white hover:scale-105 transition-all duration-300 ease-in-out"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-[#000066] text-white rounded-3xl hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out"
                                    onClick={handleSaveEdit}
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isAddYearModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-3xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#000066] transition"
                                placeholder="เช่น 1/2571"
                                required
                            />
                            <div className="flex justify-end gap-2 mb-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-3xl hover:bg-red-500 hover:text-white transition"
                                    onClick={() => setIsAddYearModalOpen(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-[#000066] text-white rounded-3xl hover:bg-green-600 transition"
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
                                        {yearOptions.find(y => y.id === selectedSemester)?.semester || 'เลือกปีการศึกษาที่ต้องการลบ'}
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
                                                    setSelectedSemester(null);
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
                                                        setSelectedSemester(term.id);
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
                                    disabled={!selectedSemester}
                                    onClick={handleDeleteYear}
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

export default StaffProject;