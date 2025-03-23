import axios from "axios";
import { HOSTNAME } from "../config";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function NewPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // รับ token จาก query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('tk');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location]);

  const validatePassword = (password) => {
    // ตรวจสอบความยาว
    if (password.length < 8) {
      return "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
    }
    // ตรวจสอบตัวเลข
    if (!/\d/.test(password)) {
      return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
    }
    // ตรวจสอบตัวอักษรพิเศษ
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรพิเศษอย่างน้อย 1 ตัว";
    }
    // ตรวจสอบตัวอักษรใหญ่
    if (!/[A-Z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรใหญ่อย่างน้อย 1 ตัว";
    }
    // ตรวจสอบตัวอักษรเล็ก
    if (!/[a-z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรเล็กอย่างน้อย 1 ตัว";
    }
    return null;
  };

  const onSubmit = (e) => {
    setLoading(true);
    setError("");
    setSuccess("");

    // ตรวจสอบว่ามี token หรือไม่
    if (!token) {
      setError("ไม่พบโทเค็นสำหรับตั้งรหัสผ่านใหม่ กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ");
      setLoading(false);
      return;
    }

    // ตรวจสอบว่ารหัสผ่านและยืนยันรหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    // ตรวจสอบความซับซ้อนของรหัสผ่าน
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // ส่งข้อมูลไปยัง API
    const data = {
      token: token,
      password: password,
    };

    axios
      .post(`${HOSTNAME}/auth/t/set-password`, data)
      .then((res) => {
        setSuccess("ตั้งรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณ");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      })
      .catch((err) => {
        console.log(err);
        setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการตั้งรหัสผ่าน กรุณาลองใหม่อีกครั้ง");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  return (
    <div className="w-full h-[96dvh] flex flex-col gap-2 justify-center items-center bg-background">
      <div className="shadow-xl p-10 md:p-16 rounded-xl bg-white border border-line-alt max-w-md w-full transition-all duration-300 hover:shadow-2xl">
        <div className="mb-8 text-center">
          <div className="inline-block p-4 mb-4 bg-primary/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-center text-2xl md:text-3xl font-bold text-primary font-heading">ตั้งรหัสผ่านใหม่</h1>
          <div className="mt-2 h-1 w-16 bg-secondary mx-auto rounded-full"></div>
          <p className="mt-4 text-text-color-alt text-sm font-body">
            กรุณาตั้งรหัสผ่านใหม่ที่มีความปลอดภัยเพื่อใช้ในการเข้าสู่ระบบ
          </p>
        </div>
        
        <div className="mt-6 space-y-5 font-body">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </p>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-text-color flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-color-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="รหัสผ่านใหม่"
                className="pl-10 pr-10 mt-1 block w-full h-12 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-color-alt hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-color flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-color-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                className="pl-10 pr-10 mt-1 block w-full h-12 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-color-alt hover:text-primary transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mt-4">
            <h4 className="font-medium mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              รหัสผ่านต้องประกอบด้วย:
            </h4>
            <ul className="list-disc list-inside ml-1 space-y-1">
              <li>ความยาวอย่างน้อย 8 ตัวอักษร</li>
              <li>มีตัวเลขอย่างน้อย 1 ตัว</li>
              <li>มีตัวอักษรพิเศษอย่างน้อย 1 ตัว</li>
              <li>มีตัวอักษรใหญ่อย่างน้อย 1 ตัว</li>
              <li>มีตัวอักษรเล็กอย่างน้อย 1 ตัว</li>
            </ul>
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="button" 
              className={`w-full py-3 px-5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 flex items-center justify-center ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-primary hover:bg-accent"
              }`}
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  ตั้งรหัสผ่านใหม่
                </>
              )}
            </button>
            
            <div className="text-center mt-4">
              <span className="text-text-color-alt text-sm">มีบัญชีผู้ใช้แล้ว? </span>
              <a href="/login" className="text-secondary hover:underline text-sm font-medium">กลับไปหน้าเข้าสู่ระบบ</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-text-color-alt text-sm font-body">
        © {new Date().getFullYear()} ระบบบันทึกและติดตามการเข้าเรียนและกิจกรรมของนักเรียน
      </div>
    </div>
  );
}

export default NewPassword;
