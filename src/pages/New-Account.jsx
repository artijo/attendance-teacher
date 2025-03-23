import axios from "axios";
import { HOSTNAME } from "../config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function NewLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    const data = {
      email: email,
    };

    axios
      .post(`${HOSTNAME}/auth/t/new-login`, data)
      .then((res) => {
        setSuccess(res.data.massage);
      })
      .catch((err) => {
        console.log(err);
        setError(err.response.data.massage);
      });
  }
  
  return (
    <div className="w-full h-[96dvh] flex flex-col gap-2 justify-center items-center bg-background">
      <div className="shadow-xl p-10 md:p-16 rounded-xl bg-white border border-line-alt max-w-md w-full transition-all duration-300 hover:shadow-2xl">
        <div className="mb-8 text-center">
          <div className="inline-block p-4 mb-4 bg-primary/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-center text-2xl md:text-3xl font-bold text-primary font-heading">ลงทะเบียนบัญชีใหม่</h1>
          <div className="mt-2 h-1 w-16 bg-secondary mx-auto rounded-full"></div>
          <p className="mt-4 text-text-color-alt text-sm font-body">
            กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสผ่านเข้าสู่ระบบ
          </p>
        </div>
        
        <div className="mt-6 space-y-5 font-body">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {error}
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
                <p className="mt-2 ml-7 text-green-600 text-xs">
                  โปรดตรวจสอบอีเมลของคุณเพื่อขั้นตอนถัดไป
                </p>
            </div>
            )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-text-color flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              อีเมล
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-color-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                placeholder="example@nps.ac.th"
                className="pl-10 mt-1 block w-full h-12 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className="text-xs text-text-color-alt mt-1">กรุณาใช้อีเมลที่ลงทะเบียนกับทางโรงเรียน</p>
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="button" 
              className="w-full py-3 px-5 text-sm font-medium text-white bg-primary hover:bg-accent rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 flex items-center justify-center"
              onClick={onSubmit}
              disabled={success}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
              ส่งลิงก์ตั้งรหัสผ่านทางอีเมล
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
export default NewLogin;
