import axios from "axios";
import { HOSTNAME } from "../config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { validateLogin } from "../validator";
import { userStore } from "../store";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setUser = userStore((state) => state.setUser);

  const onSubmit = (e) => {
    const { value, errors } = validateLogin(email, password);
    if (errors) {
      setError(errors);
      return;
    }
    const data = {
      email: value.email,
      password: value.password,
    };

    axios
      .post(`${HOSTNAME}/auth/t/login`, data)
      .then((res) => {
        localStorage.setItem("accessToken", res.data.token);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        setUser(res.data.user);
        navigate("/dashboard");
      })
      .catch((err) => {
        console.log(err);
        setError("เข้าสู่ระบบไม่สำเร็จ");
      });
  }
  
  return (
    <div className="w-full h-[96dvh] flex flex-col gap-2 justify-center items-center bg-background">
      <div className="shadow-xl p-10 md:p-16 rounded-xl bg-white border border-line-alt max-w-md w-full transition-all duration-300 hover:shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-center text-2xl md:text-3xl font-bold text-primary font-heading">เข้าสู่ระบบ • สำหรับคุณครู</h1>
          <div className="mt-2 h-1 w-16 bg-secondary mx-auto rounded-full"></div>
        </div>
        
        <div className="mt-6 space-y-5 font-body">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {error.email ? error.email : error.password ? error.password : error}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-text-color">
              อีเมล
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-color-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="text"
                id="email"
                placeholder="username@mail.com"
                className="pl-10 mt-1 block w-full h-12 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-text-color">
              รหัสผ่าน
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-color-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                className="pl-10 mt-1 block w-full h-12 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="button" 
              className="w-full py-3 px-5 text-sm font-medium text-white bg-primary hover:bg-accent rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 flex items-center justify-center"
              onClick={onSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              เข้าสู่ระบบ
            </button>
            
            <div className="text-center">
              <span className="text-text-color-alt text-sm">ยังไม่มีบัญชี? </span>
              <a href="#" className="text-secondary hover:underline text-sm">ติดต่อผู้ดูแลระบบ</a>
              <span className="text-text-color-alt text-sm"> หรือ </span>
              <a href="/new-login" className="text-secondary hover:underline text-sm">เข้าใช้งานครั้งแรก?</a>
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
export default Login;
