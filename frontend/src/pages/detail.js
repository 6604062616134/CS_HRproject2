import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";

function Detail({ type }) {
    const { id } = useParams();
    const [personDetail, setPersonDetail] = useState(null);
    const [assignations, setAssignations] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [sortOrder, setSortOrder] = useState("asc");
    const [sortField, setSortField] = useState("eventDateStart");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentAssignation, setCurrentAssignation] = useState(null);
    const [useTodayAsEndDate, setUseTodayAsEndDate] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [role, setRole] = useState(''); // State for user role
    const [editData, setEditData] = useState({
        a_number: '',
        docName: '',
        eventName: '',
        detail: '',
        eventDateStart: '',
        eventDateEnd: '',
    });

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/getUser', {
                    withCredentials: true,
                });
                setRole(response.data.role); // ตั้งค่า role จาก API
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                    window.location.href = '/'; // เปลี่ยนเส้นทางไปยังหน้าล็อกอิน
                } else {
                    console.error('Error deleting student data:', error);
                    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
                }
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const endpoint = type === 'teacher'
                    ? `http://localhost:8000/teacher/${id}`
                    : `http://localhost:8000/staff/${id}`;
                const response = await axios.get(endpoint, {
                    withCredentials: true, // เพิ่มการตั้งค่านี้
                });
                setPersonDetail(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                    window.location.href = '/'; // เปลี่ยนเส้นทางไปยังหน้าล็อกอิน
                } else {
                    console.error('Error deleting student data:', error);
                    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
                }
            }
        };

        fetchDetail();
    }, [id, type]);

    useEffect(() => {
        const fetchAssignations = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/assignation/${id}`, {
                    params: { type },
                    withCredentials: true, // เพิ่มการตั้งค่านี้
                });
                setAssignations(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                    window.location.href = '/'; // เปลี่ยนเส้นทางไปยังหน้าล็อกอิน
                } else {
                    console.error('Error deleting student data:', error);
                    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
                }
            }
        };

        fetchAssignations();
    }, [id, type]);

    if (!personDetail) {
        return <div>Loading...</div>;
    }

    const filteredAssignations = assignations.filter((assignation) => {
        const eventStart = new Date(assignation.eventDateStart);
        const eventEnd = new Date(assignation.eventDateEnd);
        const search = searchTerm.toLowerCase();

        const hasStartDate = !!filterStartDate;
        const hasEndDate = !!filterEndDate;

        // กรองข้อมูลตามคำค้นหา
        const matchesSearch = assignation.a_number?.toLowerCase().includes(search) ||
            assignation.docName?.toLowerCase().includes(search) ||
            assignation.eventName?.toLowerCase().includes(search) ||
            assignation.detail?.toLowerCase().includes(search);

        // กรณีที่ไม่ได้กรอกทั้งวันที่เริ่มต้นและวันที่สิ้นสุด
        if (!hasStartDate && !hasEndDate) return matchesSearch;

        // กรณีที่กรอกแค่วันที่เริ่มต้น
        if (hasStartDate && !hasEndDate) {
            const filterStart = new Date(filterStartDate + 'T00:00:00');
            return matchesSearch && eventStart >= filterStart;
        }

        // กรณีที่กรอกทั้งวันที่เริ่มต้นและวันที่สิ้นสุด
        if (hasStartDate && hasEndDate) {
            const filterStart = new Date(filterStartDate + 'T00:00:00');
            const filterEnd = new Date(filterEndDate + 'T23:59:59');
            return matchesSearch && eventStart >= filterStart && eventStart <= filterEnd;
        }

        // กรณีที่กรอกแค่วันที่สิ้นสุด
        if (!hasStartDate && hasEndDate) {
            const filterEnd = new Date(filterEndDate + 'T23:59:59');
            return matchesSearch && eventStart <= filterEnd;
        }

        return matchesSearch;
    });

    const toggleSortOrder = (field) => {
        setSortField(field); // ตั้งค่าฟิลด์ที่ต้องการเรียงลำดับ
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc")); // สลับลำดับการเรียง
    };

    const handleEdit = (assignation) => {
        setCurrentAssignation(assignation);
        setEditData({
            a_number: assignation.a_number || '',
            docName: assignation.docName || '',
            eventName: assignation.eventName || '',
            detail: assignation.detail || '',
            eventDateStart: assignation.eventDateStart || '',
            eventDateEnd: assignation.eventDateEnd || '',
            linkFile: assignation.linkFile || '',
        });
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setCurrentAssignation(null);
    };

    const handleDelete = async (a_number) => {
        if (window.confirm("คุณต้องการลบข้อมูลนี้หรือไม่?")) {
            try {
                await axios.delete(`http://localhost:8000/assignation/delete/${a_number}`,
                    { withCredentials: true }
                );
                alert("ลบข้อมูลสำเร็จ!");
                setAssignations((prev) => prev.filter((assignation) => assignation.a_number !== a_number));
                setIsEditModalOpen(false); // ปิด Modal หลังจากลบข้อมูลสำเร็จ
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                    window.location.href = '/'; // เปลี่ยนเส้นทางไปยังหน้าล็อกอิน
                } else {
                    console.error('Error deleting student data:', error);
                    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
                }
            }
        }
    };

    const handleSave = async () => {
        if (!currentAssignation?.a_ID) {
            alert('ไม่พบข้อมูลที่ต้องการแก้ไข');
            return;
        }

        try {
            await axios.put(`http://localhost:8000/assignation/update/${currentAssignation.a_ID}`, {
                a_number: editData.a_number,
                docName: editData.docName,
                eventName: editData.eventName,
                detail: editData.detail,
                eventDateStart: editData.eventDateStart,
                eventDateEnd: editData.eventDateEnd,
                linkFile: editData.linkFile,
            });
            alert('บันทึกข้อมูลสำเร็จ!');
            setIsEditModalOpen(false); // ปิด Modal หลังจากบันทึกข้อมูลสำเร็จ

            // อัปเดตข้อมูลในตาราง
            setAssignations((prev) =>
                prev.map((assignation) =>
                    assignation.a_ID === currentAssignation.a_ID
                        ? { ...assignation, ...editData }
                        : assignation
                )
            );
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert('เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่');
                window.location.href = '/'; // เปลี่ยนเส้นทางไปยังหน้าล็อกอิน
            } else {
                console.error('Error deleting student data:', error);
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    return (
        <div>
            <Navbar className="print:hidden" />
            <div className="container mt-10 px-12 pt-8 pb-8">
                <div className="flex flex-row gap-4">
                    {type === 'teacher' ? (
                        <p className="text-lg font-semibold mt-6 text-left">
                            {personDetail.t_AcademicRanks} {personDetail.t_name} <strong>{personDetail.t_code}</strong>
                        </p>
                    ) : (
                        <p className="text-lg font-semibold mt-6 text-left">{personDetail.s_name}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div>
                            <input
                                type="text"
                                placeholder="ค้นหา..."
                                className="w-60 px-4 py-2 mt-3 text-xs border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 print:hidden text-left">วันที่เริ่มต้น</label>
                            <input
                                type="date"
                                className="w-40 px-4 py-2 text-xs border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 print:hidden text-left">วันที่สิ้นสุด</label>
                            <input
                                type="date"
                                className="w-40 px-4 py-2 text-xs border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button
                            className="px-4 py-2 bg-[#000066] text-white text-xs rounded-3xl shadow-lg hover:bg-gray-600 mt-4 transition-all duration-300 ease-in-out focus:outline-none print:hidden"
                            onClick={() => {
                                if (!startDate) {
                                    alert("กรุณาเลือกวันที่เริ่มต้นก่อนค้นหา");
                                    return;
                                }

                                if (endDate && new Date(endDate) < new Date(startDate)) {
                                    alert("วันที่สิ้นสุดต้องอยู่ถัดจากวันที่เริ่มต้น");
                                    return;
                                }

                                const today = new Date().toISOString().split("T")[0];
                                setFilterStartDate(startDate);
                                setFilterEndDate(endDate || (useTodayAsEndDate ? today : ""));
                            }}
                        >
                            ค้นหา
                        </button>
                    </div>
                </div>
            </div>
            <div className="activityTable overflow-x-auto">
                <div className="w-full max-w-full mx-auto pr-12 pl-12">
                    <h2 className="text-lg font-bold">ข้อมูลกิจกรรม</h2>
                    <table className="table-auto w-full border-collapse border border-gray-300 activityTableBorder">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 w-12 text-xs">ลำดับ</th>
                                <th className="border border-gray-300 px-4 py-2 w-12 text-xs">เลขคำสั่ง</th>
                                <th className="border border-gray-300 px-4 py-2 w-12 text-xs">ชื่อเอกสาร</th>
                                <th className="border border-gray-300 px-4 py-2 w-1/3 text-xs">ชื่อกิจกรรม</th>
                                <th className="border border-gray-300 px-4 py-2 w-24 text-xs">รายละเอียด</th>
                                <th
                                    className="border border-gray-300 px-4 py-2 w-12 text-xs cursor-pointer hover:bg-gray-200"
                                    onClick={toggleSortOrder}
                                >
                                    วันที่เริ่มต้น {sortOrder === "asc" ? <span className="print:hidden">▲</span> : <span className="print:hidden">▼</span>}
                                </th>
                                <th className="border border-gray-300 px-4 py-2 text-xs w-12">วันที่สิ้นสุด</th>
                                <th className="border border-gray-300 px-4 py-2 text-xs w-12 print:hidden">ลิงค์ไฟล์</th>
                                <th className="border border-gray-300 px-4 py-2 w-8 text-xs print:hidden">แก้ไข</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssignations.length > 0 ? (
                                [...filteredAssignations]
                                    .sort((a, b) => {
                                        const dateA = new Date(a.eventDateStart);
                                        const dateB = new Date(b.eventDateStart);
                                        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                                    })
                                    .map((assignation, index) => {
                                        const formatDate = (date) => {
                                            if (!date) return '-';
                                            return new Intl.DateTimeFormat('th-TH', {
                                                day: 'numeric',
                                                month: 'numeric',
                                                year: 'numeric',
                                                calendar: 'buddhist', // ใช้ปฏิทินพุทธศักราช
                                            }).format(new Date(date));
                                        };
                                        return (
                                            <tr key={`${assignation.a_number}-${index}`} className="text-center">
                                                <td className="border border-gray-300 px-4 py-2 text-xs">{index + 1}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-xs">{assignation.a_number}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-xs">{assignation.docName}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-xs">{assignation.eventName}</td>
                                                <td className="border border-gray-300 px-4 py-2 break-words whitespace-normal max-w-[200px] text-left text-xs">{assignation.detail}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-xs">
                                                    {assignation.eventDateStart ? formatDate(assignation.eventDateStart) : '-'}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-xs">
                                                    {assignation.eventDateEnd ? formatDate(assignation.eventDateEnd) : '-'}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-xs print:hidden">
                                                    {assignation.linkFile && assignation.linkFile !== '-' ? (
                                                        <a
                                                            href={assignation.linkFile}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 text-xs hover:underline"
                                                        >
                                                            ไฟล์ที่แนบ
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="border border-gray-300 px-2 py-1 text-xs print:hidden">
                                                    {role === 'superadmin' && (
                                                        <button
                                                            className="px-2 py-1 bg-[#000066] text-white rounded-3xl hover:scale-105 hover:bg-white hover:text-black shadow-lg transition-transform duration-300 text-xs"
                                                            onClick={() => handleEdit(assignation)}
                                                        >
                                                            แก้ไข
                                                        </button>
                                                    )}
                                                </td>

                                            </tr>
                                        );
                                    })
                            ) : (
                                <tr>
                                    <td colSpan="9" className="border border-gray-300 px-4 py-2 text-xs text-center">
                                        ไม่มีข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
                            <div className="flex justify-between items-center gap-4 mb-2">
                                <h2 className="block text-lg font-semibold text-gray-700">แก้ไขข้อมูล</h2>
                                <button
                                    className="px-2 py-1 bg-red-500 text-white rounded-3xl shadow-lg hover:bg-red-600 text-xs hover:scale-105 transition-transform duration-300"
                                    onClick={() => handleDelete(currentAssignation.a_number)}
                                >
                                    ลบข้อมูล
                                </button>
                            </div>
                            <div className="mb-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">เลขคำสั่ง</label>
                                    <input
                                        type="text"
                                        value={editData.a_number}
                                        onChange={(e) => setEditData({ ...editData, a_number: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ชื่อเอกสาร</label>
                                    <input
                                        type="text"
                                        value={editData.docName}
                                        onChange={(e) => setEditData({ ...editData, docName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ชื่อกิจกรรม</label>
                                    <input
                                        type="text"
                                        value={editData.eventName}
                                        onChange={(e) => setEditData({ ...editData, eventName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                                    <textarea
                                        value={editData.detail}
                                        onChange={(e) => setEditData({ ...editData, detail: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                                        <input
                                            type="date"
                                            value={editData.eventDateStart}
                                            onChange={(e) => setEditData({ ...editData, eventDateStart: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                                        <input
                                            type="date"
                                            value={editData.eventDateEnd}
                                            onChange={(e) => setEditData({ ...editData, eventDateEnd: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ลิงก์ไฟล์</label>
                                    <input
                                        type="text"
                                        value={editData.linkFile}
                                        onChange={(e) => setEditData({ ...editData, linkFile: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="ลิงก์ไฟล์"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded-3xl -3xl shadow-lg hover:bg-red-600 hover:scale-105 hover:text-white transition-transform duration-300"
                                    onClick={handleCloseModal}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    className="px-4 py-2 bg-[#000066] text-white rounded-3xl shadow-lg hover:text-white hover:scale-105 hover:bg-green-600 transition-transform duration-300"
                                    onClick={handleSave}
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >

    );
}

export default Detail;