import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";

function Assign() {
    const [eventName, setEventName] = useState('');
    const [eventDateStart, setEventDateStart] = useState('');
    const [eventDateEnd, setEventDateEnd] = useState('');
    const [number, setNumber] = useState(''); //เลขคำสั่ง(เป็นnullได้)
    const [docName, setDocName] = useState(''); //ชื่อเอกสาร
    const [teachers, setTeachers] = useState([]); // รายชื่ออาจารย์
    const [selectedTeachers, setSelectedTeachers] = useState([]); // เก็บอาจารย์ที่ถูกเลือก
    const [detail, setDetail] = useState(''); // รายละเอียดงาน
    const [staff, setStaff] = useState([]); // รายชื่อเจ้าหน้าที่
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropdownStaffOpen, setIsDropdownStaffOpen] = useState(false);
    const [link, setLink] = useState(''); // ลิงก์ Google Drive
    const dropdownRef = useRef(null); // สำหรับดรอปดาวน์อาจารย์
    const dropdownStaffRef = useRef(null); // สำหรับดรอปดาวน์เจ้าหน้าที่
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;
    registerLocale("th", th);

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
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false); // ปิดดรอปดาวน์อาจารย์
            }
            if (dropdownStaffRef.current && !dropdownStaffRef.current.contains(event.target)) {
                setIsDropdownStaffOpen(false); // ปิดดรอปดาวน์เจ้าหน้าที่
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/teacher/', {
                    withCredentials: true,
                });
                setTeachers(response.data); // อัปเดต state ด้วยข้อมูลอาจารย์
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchTeachers();
    }, []);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await axios.get('http://localhost:8000/staff/',
                    {
                        withCredentials: true,
                    }
                ); // URL ของ API
                setStaff(response.data); // อัปเดต state ด้วยข้อมูลเจ้าหน้าที่
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchStaff();
    }, []);

    useEffect(() => {
        if (isDropdownOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Cleanup เมื่อ component ถูก unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        if (isDropdownStaffOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Cleanup เมื่อ component ถูก unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isDropdownStaffOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false); // ปิดดรอปดาวน์อาจารย์
            }
            if (dropdownStaffRef.current && !dropdownStaffRef.current.contains(event.target)) {
                setIsDropdownStaffOpen(false); // ปิดดรอปดาวน์เจ้าหน้าที่
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const createAssignation = async () => {
        try {
            const response = await axios.post('http://localhost:8000/assignation/create', {
                eventName,
                eventDateStart: eventDateStart || null, // หากไม่มีค่าให้ส่ง null
                eventDateEnd: eventDateEnd || null,
                a_number: number,
                docName,
                detail,
                selectedTeachers,
                selectedStaff,
                link,
            },
                {
                    withCredentials: true, // ย้ายมาไว้ที่นี่
                });
            console.log('Assignation created:', response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันการรีเฟรชหน้า

        // ตรวจสอบกรณีวันที่เริ่มต้นอยู่หลังวันที่สิ้นสุด (ถ้ากรอกทั้งสองวันที่)
        if (eventDateStart && eventDateEnd && new Date(eventDateStart) > new Date(eventDateEnd)) {
            alert('วันที่เริ่มต้นต้องไม่อยู่หลังวันที่สิ้นสุด');
            return; // ยกเลิกการทำงานหากเงื่อนไขไม่ถูกต้อง
        }

        // ตรวจสอบกรณีไม่ได้เลือกอาจารย์หรือเจ้าหน้าที่
        if (selectedTeachers.length === 0 && selectedStaff.length === 0) {
            alert('กรุณาเลือกอาจารย์หรือเจ้าหน้าที่อย่างน้อย 1 คน');
            return; // ยกเลิกการทำงานหากไม่มีการเลือก
        }

        try {
            await createAssignation(); // เรียก API เพื่อสร้างข้อมูล
            alert('ข้อมูลถูกส่งเรียบร้อยแล้ว!');
            handleReset(); // รีเซ็ตข้อมูลในช่องอินพุต
            handleResetSelections(); // รีเซ็ตการเลือกอาจารย์และเจ้าหน้าที่
        } catch (error) {
            console.error('Error creating assignation:', error);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        }
    };

    const handleCheckboxChange = (e, teacher) => {
        if (e.target.checked) {
            setSelectedTeachers((prev) => [...prev, teacher]);
        } else {
            setSelectedTeachers((prev) =>
                prev.filter((t) => t.t_ID !== teacher.t_ID)
            );
        }
    };

    const handleStaffCheckboxChange = (e, staffMember) => {
        if (e.target.checked) {
            setSelectedStaff((prev) => [...prev, staffMember]);
        } else {
            setSelectedStaff((prev) =>
                prev.filter((s) => s.s_ID !== staffMember.s_ID)
            );
        }
    };

    const handleReset = () => {
        setEventName('');
        setEventDateStart('');
        setEventDateEnd('');
        setNumber('');
        setDocName('');
        setDetail('');
        setLink('');
    };

    const handleResetSelections = () => {
        setSelectedTeachers([]); // ล้างรายชื่ออาจารย์ที่เลือก
        setSelectedStaff([]);    // ล้างรายชื่อเจ้าหน้าที่ที่เลือก
    };

    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center mt-20">
                <form onSubmit={handleSubmit} className="w-full max-w-5xl flex gap-8">
                    {/* ส่วนช่องกรอกข้อมูล */}
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-800">กิจกรรมบุคลากร</h2>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="underline text-red-600 hover:text-black transition-all duration-300 ease-in-out text-xs"
                            >
                                รีเซ็ตข้อมูลที่กรอก
                            </button>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">ชื่อกิจกรรม</label>
                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                placeholder="ชื่อกิจกรรม"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block mb-1 text-sm text-gray-600">วันที่เริ่มต้น</label>
                                <DatePicker
                                    selected={eventDateStart ? new Date(eventDateStart) : null}
                                    onChange={(date) =>
                                        setEventDateStart(date ? date.toISOString().split("T")[0] : "")
                                    }
                                    dateFormat="dd/MM/yy"
                                    locale="th"
                                    customInput={
                                        <button
                                            type="button"
                                            className="w-full px-6 py-2 border rounded-3xl bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        >
                                            {eventDateStart ? formatDate(eventDateStart) : "เลือกวันที่"}
                                        </button>
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block mb-1 text-sm text-gray-600">วันที่สิ้นสุด</label>
                                <DatePicker
                                    selected={eventDateEnd ? new Date(eventDateEnd) : null}
                                    onChange={(date) =>
                                        setEventDateEnd(date ? date.toISOString().split("T")[0] : "")
                                    }
                                    dateFormat="dd/MM/yy"
                                    locale="th"
                                    customInput={
                                        <button
                                            type="button"
                                            className="w-full px-6 py-2 border rounded-3xl bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                        >
                                            {eventDateEnd ? formatDate(eventDateEnd) : "เลือกวันที่"}
                                        </button>
                                    }
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm text-gray-600">เลขคำสั่ง</label>
                                <input
                                    type="text"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                    placeholder="เลขคำสั่ง"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm text-gray-600">ชื่อเอกสาร</label>
                            <input
                                type="text"
                                value={docName}
                                onChange={(e) => setDocName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066]"
                                placeholder="ชื่อเอกสาร"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">รายละเอียด</label>
                            <textarea
                                value={detail}
                                onChange={(e) => setDetail(e.target.value)}
                                className="w-full px-4 py-4 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066] h-60 resize-none"
                                placeholder="รายละเอียดงาน"
                                required
                            />
                        </div>
                    </div>

                    <div className='flex flex-col w-1/2 gap-4 mb-2'>
                        <div className="flex-1 p-4 rounded-3xl border relative h-[455px] overflow-visible">
                            <div className="flex items-center mb-4 gap-4">
                                <h3 className="font-medium text-gray-800">บุคลากร</h3>
                                <div className="relative" ref={dropdownRef}>
                                    <div
                                        className="px-2 py-1 border rounded-3xl bg-white cursor-pointer focus:outline-none shadow-lg z-50 text-xs hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 ease-in-out flex items-center justify-between"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        เลือกอาจารย์
                                        <span className={`ml-2 transform transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                    {isDropdownOpen && (
                                        <div
                                            className="absolute z-[9999] mt-2 w-64 max-h-64 overflow-y-auto bg-white border rounded-3xl shadow-lg"
                                            style={{ top: '100%' }}
                                        >
                                            {/* Select All Option */}
                                            <div className="flex items-center px-4 py-2 hover:bg-gray-50 border-b">
                                                <input
                                                    type="checkbox"
                                                    id="teacher-select-all"
                                                    checked={selectedTeachers.length === teachers.length && teachers.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedTeachers(teachers);
                                                        } else {
                                                            setSelectedTeachers([]);
                                                        }
                                                    }}
                                                    className="mr-2"
                                                />
                                                <label htmlFor="teacher-select-all" className="text-sm text-gray-700 font-semibold">
                                                    เลือกทั้งหมด
                                                </label>
                                            </div>
                                            {/* รายการอาจารย์ */}
                                            {teachers.map((teacher) => (
                                                <div key={teacher.t_ID} className="flex items-center px-4 py-2 hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        id={`teacher-${teacher.t_ID}`}
                                                        checked={selectedTeachers.some((t) => t.t_ID === teacher.t_ID)}
                                                        onChange={(e) => handleCheckboxChange(e, teacher)}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor={`teacher-${teacher.t_ID}`} className="text-sm text-gray-700">
                                                        {teacher.t_name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative" ref={dropdownStaffRef}>
                                    <div
                                        className="px-2 py-1 border rounded-3xl bg-white cursor-pointer focus:outline-none shadow-md z-50 text-xs hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 ease-in-out flex items-center justify-between"
                                        onClick={() => setIsDropdownStaffOpen(!isDropdownStaffOpen)}
                                    >
                                        เลือกเจ้าหน้าที่
                                        <span className={`ml-2 transform transition-transform duration-300 ease-in-out ${isDropdownStaffOpen ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                    {isDropdownStaffOpen && (
                                        <div
                                            className="absolute z-[9999] mt-2 w-64 max-h-64 overflow-y-auto bg-white border rounded-3xl shadow-lg"
                                            style={{ top: '100%' }}
                                        >
                                            {/* Select All Option */}
                                            <div className="flex items-center px-4 py-2 hover:bg-gray-50 border-b">
                                                <input
                                                    type="checkbox"
                                                    id="staff-select-all"
                                                    checked={selectedStaff.length === staff.length && staff.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedStaff(staff);
                                                        } else {
                                                            setSelectedStaff([]);
                                                        }
                                                    }}
                                                    className="mr-2"
                                                />
                                                <label htmlFor="staff-select-all" className="text-sm text-gray-700 font-semibold">
                                                    เลือกทั้งหมด
                                                </label>
                                            </div>
                                            {/* รายการเจ้าหน้าที่ */}
                                            {staff.map((staffMember) => (
                                                <div key={staffMember.s_ID} className="flex items-center px-4 py-2 hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        id={`staff-${staffMember.s_ID}`}
                                                        checked={selectedStaff.some((s) => s.s_ID === staffMember.s_ID)}
                                                        onChange={(e) => handleStaffCheckboxChange(e, staffMember)}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor={`staff-${staffMember.s_ID}`} className="text-sm text-gray-700">
                                                        {staffMember.s_name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleResetSelections}
                                    className="underline text-red-600 hover:text-black transition-all duration-300 ease-in-out text-xs"
                                >
                                    รีเซ็ตรายการที่เลือก
                                </button>
                            </div>
                            <div className="max-h-[320px] overflow-y-auto pb-2">
                                {selectedTeachers.length > 0 || selectedStaff.length > 0 ? (
                                    <>
                                        {/* แสดงรายชื่ออาจารย์ที่เลือก */}
                                        {selectedTeachers.map((teacher, index) => (
                                            <div
                                                key={teacher.t_ID}
                                                className="flex items-center text-sm text-gray-700 border-b border-gray-300 pb-2 mb-2"
                                            >
                                                <span>{teacher.t_AcademicRanks}</span>
                                                <span className="ml-1">{teacher.t_name}</span>
                                                <span className="ml-4 font-bold">{teacher.t_code}</span>
                                            </div>
                                        ))}

                                        {/* แสดงรายชื่อเจ้าหน้าที่ที่เลือก */}
                                        {selectedStaff.map((staffMember, index) => (
                                            <div
                                                key={staffMember.s_ID}
                                                className="flex items-center text-sm text-gray-700 border-b border-gray-300 pb-2 mb-2"
                                            >
                                                <span>{staffMember.s_name}</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500">ยังไม่มีอาจารย์หรือเจ้าหน้าที่ถูกเลือก</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-gray-600">แนบลิงก์ (ถ้ามี)</label>
                            <textarea
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full px-4 py-4 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#000066] h-24 resize-none" // ลดความสูงจาก h-40 เป็น h-32
                                placeholder="เช่น google drive"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#000066] hover:bg-green-600 text-white py-2 hover:scale-105 rounded-3xl shadow-xl transition-all duration-300 ease-in-out"
                        >
                            ยืนยัน
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Assign;