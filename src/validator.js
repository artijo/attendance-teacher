import * as yup from 'yup';

export function validateLogin(email, password) {
    const schema = yup.object({
        email: yup.string()
                .email("กรุณากรอกอีเมลให้ถูกต้อง")
                .required("กรุณากรอกอีเมล"),
        password: yup.string()
                    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
                    .required("กรุณากรอกรหัสผ่าน"),
    });
    
    try {
        const result = schema.validateSync({ email, password }, { abortEarly: false });
        return { success: true, value: result };
    } catch (error) {
        // Format Yup error messages
        const formattedErrors = {};
        if (error.inner && Array.isArray(error.inner)) {
            error.inner.forEach((err) => {
                formattedErrors[err.path] = err.message;
            });
        }
        return { success: false, errors: formattedErrors };
    }
}
