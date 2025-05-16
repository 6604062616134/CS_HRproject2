import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

function AdminReport() {
    const [reports, setReports] = useState([]);

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

    return (
        <div className="flex flex-col h-screen">
            <Navbar className="print:hidden" />
            <div className="flex flex-col p-4 px-20 mt-16 print:mt-0 flex-grow w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">รายงานจากผู้ใช้</h2>
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
                            {reports.length > 0 ? (
                                reports.map((item, idx) => (
                                    <tr key={item.r_ID || idx}>
                                        <td className="px-4 py-2 border text-xs text-center max-w-[8px] min-w-[8px] break-words whitespace-normal">{idx + 1}</td>
                                        <td className="px-4 py-2 border text-xs text-center max-w-[80px] min-w-[80px] break-words whitespace-normal">
                                            {/* แสดง academicRanks (ถ้ามี) นำหน้าชื่อ */}
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