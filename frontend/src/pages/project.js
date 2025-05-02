import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NavbarProject from '../components/navbar-project';

function Project() {
    const [students, setStudents] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // สำหรับช่องค้นหา
    const [searchTermYear, setSearchTermYear] = useState(''); // สำหรับดรอปดาวน์เลือกเทอม
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // สำหรับเปิด/ปิดดรอปดาวน์
    const [role, setRole] = useState('');
    const dropdownRef = useRef(null); // สำหรับดรอปดาวน์

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/student/all',

                {
                    withCredentials: true,
                }
            );
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

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
                console.error('Error fetching user role:', error);
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
            console.error('Error deleting student data:', error);
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <NavbarProject fetchData={fetchData} className="print:hidden" />
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
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="px-4 py-2 border rounded-3xl bg-white cursor-pointer focus:outline-none z-50 text-xs hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 ease-in-out flex items-center justify-between"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {searchTermYear || 'เลือกเทอม'}
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
                                            setSearchTermYear(''); // ตั้งค่าเป็นค่าว่าง
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        -
                                    </div>
                                    {/* ตัวเลือกเทอม */}
                                    {['1/2566', '2/2566', '1/2567', '2/2567', '1/2568', '2/2568', '1/2569', '2/2569', '1/2570', '2/2570'].map((term) => (
                                        <div
                                            key={term}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                                            onClick={() => {
                                                setSearchTermYear(term);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {term}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto flex-grow w-full">
                    <table className="w-full bg-white border border-gray-300 rounded-3xl print-cell">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="px-4 py-2 border text-xs col-index">ลำดับ</th>
                                <th className="px-4 py-2 border text-xs col-date">วันที่สอบ</th>
                                <th className="px-4 py-2 border text-xs col-nameHeader">หัวข้อ</th>
                                <th className="px-4 py-2 border text-xs col-id">รหัส</th>
                                <th className="px-4 py-2 border text-xs col-name">ชื่อ-นามสกุล</th>
                                <th className="px-4 py-2 border text-xs col-chairman rotate">ประธานกรรมการ</th>
                                <th className="px-4 py-2 border text-xs col-director rotate">กรรมการ</th>
                                <th className="px-4 py-2 border text-xs col-main-mentor rotate">อาจารย์ที่ปรึกษาหลัก</th>
                                <th className="px-4 py-2 border text-xs col-co-mentor rotate">อาจารย์ที่ปรึกษาร่วม</th>
                                <th className="px-4 py-2 border text-xs col-year rotate">ปีการศึกษา</th>
                                <th className="px-4 py-2 border text-xs col-room rotate">ห้องสอบ</th>
                                <th className="px-4 py-2 border text-xs col-grade rotate">เกรดที่ได้</th>
                                <th className="px-4 py-2 border text-xs col-note rotate">หมายเหตุ</th>
                                <th className="px-4 py-2 border text-xs print:hidden col-edit">แก้ไข</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id || index}>
                                        <td className="px-4 py-2 border text-xs text-center col-index">{index + 1}</td>
                                        <td className="px-4 py-2 border text-xs text-center col-date">
                                            {new Date(student.datetime).toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-2 border text-xs break-words whitespace-normal col-thesis">
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
                                        <td className="px-2 py-2 border text-xs break-words whitespace-normal col-id">
                                            {student.studentCode1}
                                            <br />
                                            {student.studentCode2}
                                        </td>
                                        <td className="px-2 py-2 border text-xs break-words whitespace-normal col-name">
                                            {student.FLname1}
                                            <br />
                                            {student.FLname2}
                                        </td>
                                        <td className="px-2 py-2 border text-xs text-center col-chairman">{student.chairman}</td>
                                        <td className="px-2 py-2 border text-xs text-center col-director">{student.director}</td>
                                        <td className="px-2 py-2 border text-xs text-center col-main-mentor">{student.MainMentor}</td>
                                        <td className="px-2 py-2 border text-xs text-center col-co-mentor">{student.CoMentor}</td>
                                        <td className="px-2 py-2 border text-xs text-center col-year">{student.year}</td>
                                        <td className="px-2 py-2 border text-xs text-center col-room">{student.room}</td>
                                        <td className="px-2 py-2 border text-xs text-center col-grade">{student.grade}</td>
                                        <td className="px-2 py-2 border text-xs text-center col-note">{student.note}</td>
                                        <td className="px-2 py-2 border text-xs text-center print:hidden col-edit">
                                            {role === 'superadmin' && (
                                                <button
                                                    className="px-2 py-1 bg-[#000066] text-white rounded-3xl z-50 hover:scale-105 hover:bg-white hover:text-black shadow-lg transition-transform duration-300"
                                                    onClick={() => handleEditModalOpen(student)}
                                                >
                                                    แก้ไข
                                                </button>
                                            )}
                                        </td>
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
                                        <div className="flex-[2] min-w-[300px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ปริญญานิพนธ์เรื่อง (ไทย)</label>
                                            <input
                                                type="text"
                                                name="thesisnameTH"
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
                                                value={editData?.thesisnameEN || ''}
                                                onChange={(e) => setEditData({ ...editData, thesisnameEN: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา 1</label>
                                            <input
                                                type="text"
                                                name="studentCode1"
                                                value={editData?.studentCode1 || ''}
                                                onChange={(e) => setEditData({ ...editData, studentCode1: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา 2</label>
                                            <input
                                                type="text"
                                                name="studentCode2"
                                                value={editData?.studentCode2 || ''}
                                                onChange={(e) => setEditData({ ...editData, studentCode2: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-[2] min-w-[300px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (นักศึกษา 1)</label>
                                            <input
                                                type="text"
                                                name="FLname1"
                                                value={editData?.FLname1 || ''}
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
                                                onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                            />
                                        </div>
                                        <div className="flex-[2] min-w-[300px]">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                                            <textarea
                                                name="note"
                                                value={editData?.note || ''}
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
        </div>
    );
}

export default Project;