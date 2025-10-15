import * as yup from "yup";

/**
 * Helper function to validate data with Yup schema
 * @param {yup.ObjectSchema} schema - Yup validation schema
 * @param {Object} data - Data to validate
 * @returns {Object} - { success: boolean, value?: Object, errors?: Object }
 */
function validateWithSchema(schema, data) {
  try {
    const result = schema.validateSync(data, { abortEarly: false });
    return { success: true, value: result };
  } catch (error) {
    const formattedErrors = {};
    if (error.inner && Array.isArray(error.inner)) {
      error.inner.forEach((err) => {
        formattedErrors[err.path] = err.message;
      });
    }
    return { success: false, errors: formattedErrors };
  }
}

export function validateLogin(email, password) {
  const schema = yup.object({
    email: yup
      .string()
      .email("กรุณากรอกอีเมลให้ถูกต้อง")
      .required("กรุณากรอกอีเมล"),
    password: yup
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .required("กรุณากรอกรหัสผ่าน"),
  });

  return validateWithSchema(schema, { email, password });
}
