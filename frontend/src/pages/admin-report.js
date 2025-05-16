import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

function AdminReport() {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchDate, setSearchDate] = useState(''); // เพิ่ม state สำหรับค้นหาวันที่
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get('http://localhost:8000/user/getAllreport', { withCredentials: true });
                setReports(res.data);
            } catch (error) {
                setReports([]);
            }
        };
        fetchReports();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // ฟิลเตอร์ข้อมูลตามชื่อ, role และวันที่
    const filteredReports = reports.filter(item => {
        const name = ((item.academicRanks ? item.academicRanks + " " : "") + (item.teacherName || item.staffName || '')).toLowerCase();
        const matchName = name.includes(searchTerm.toLowerCase());
        const matchRole =
            roleFilter === 'all'
                ? true
                : roleFilter === 'teacher'
                ? !!item.t_ID
                : roleFilter === 'staff'
                ? !!item.s_ID
                : true;
        // ถ้ามีการกรอกวันที่ ให้เปรียบเทียบเฉพาะวันที่ (yyyy-mm-dd)
        const matchDate = searchDate
            ? item.created && new Date(item.created).toISOString().slice(0, 10) === searchDate
            : true;
        return matchName && matchRole && matchDate;
    });

    // ตัวเลือก role
    const roleOptions = [
        { value: 'all', label: 'ทุก role' },
        { value: 'teacher', label: 'teacher' },
        { value: 'staff', label: 'staff' }
    ];

    return (
        <div className="flex flex-col h-screen">
            <Navbar className="print:hidden" />
            <div className="flex flex-col p-4 px-20 mt-16 print:mt-0 flex-grow w-full">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">รายงานจากผู้ใช้</h2>
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-3xl text-xs focus:outline-none focus:ring-2 focus:ring-[#000066] w-64"
                    />
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className="px-4 py-2 border rounded-3xl bg-white cursor-pointer focus:outline-none z-50 text-xs hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 ease-in-out flex items-center justify-between min-w-[120px]"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {roleOptions.find(r => r.value === roleFilter)?.label || 'ทุก role'}
                            <span className={`ml-2 transform transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </div>
                        {isDropdownOpen && (
                            <div
                                className="absolute z-[9999] mt-2 w-full max-h-48 overflow-y-auto bg-white border rounded-2xl shadow-lg"
                                style={{ top: '100%' }}
                            >
                                {roleOptions.map(option => (
                                    <div
                                        key={option.value}
                                        className={`px-4 py-2 hover:bg-[#000066] hover:text-white cursor-pointer text-xs text-gray-700 transition-all duration-300 ease-in-out ${roleFilter === option.value ? 'bg-[#000066] text-white' : ''}`}
                                        onClick={() => {
                                            setRoleFilter(option.value);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* ค้นหาจากวันที่ส่ง */}
                    <input
                        type="date"
                        value={searchDate}
                        onChange={e => setSearchDate(e.target.value)}
                        className="px-4 py-2 border rounded-3xl text-xs focus:outline-none focus:ring-2 focus:ring-[#000066]"
                        placeholder="ค้นหาวันที่ส่ง"
                    />
                </div>
                <div className="overflow-x-auto flex-grow w-full">
                    <table className="w-full bg-white border border-gray-300 rounded-3xl print-cell">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="px-4 py-2 border text-xs max-w-[8px] min-w-[8px] break-words whitespace-normal">ลำดับ</th>
                                <th className="px-4 py-2 border text-xs max-w-[80px] min-w-[80px] break-words whitespace-normal">ชื่อ</th>
                                <th className="px-4 py-2 border text-xs max-w-[20px] min-w-[20px] break-words whitespace-normal">Role</th>
                                <th className="px-4 py-2 border text-xs max-w-[38px] min-w-[38px] break-words whitespace-normal">วันที่ส่ง</th>
                                <th className="px-4 py-2 border text-xs max-w-[200px] min-w-[120px] break-words whitespace-normal">ข้อความ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.length > 0 ? (
                                filteredReports.map((item, idx) => (
                                    <tr key={item.r_ID || idx}>
                                        <td className="px-4 py-2 border text-xs text-center max-w-[8px] min-w-[8px] break-words whitespace-normal">{idx + 1}</td>
                                        <td className="px-4 py-2 border text-xs text-center max-w-[80px] min-w-[80px] break-words whitespace-normal">
                                            {(item.academicRanks ? item.academicRanks + " " : "") + (item.teacherName || item.staffName || '-')}
                                        </td>
                                        <td className="px-4 py-2 border text-xs text-center max-w-[20px] min-w-[20px] break-words whitespace-normal">
                                            {item.t_ID ? 'teacher' : item.s_ID ? 'staff' : '-'}
                                        </td>
                                        <td className="px-4 py-2 border text-xs text-center max-w-[38px] min-w-[38px] break-words whitespace-normal">
                                            {item.created ? new Date(item.created).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                        </td>
                                        <td className="px-4 py-2 border text-xs break-words whitespace-normal max-w-[200px] min-w-[120px]">
                                            {item.reportMessage}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-2 text-center text-xs text-gray-500">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminReport;