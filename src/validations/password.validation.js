// backend/src/validations/password.validation.js
const Password = (password) => 
{
    const minLength = 6;
    const hasUpperCase = /[A-ZÁÉÍÓÚÑ]/.test(password); // Incluye letras con acento y Ñ mayúscula
    const hasLowerCase = /[a-záéíóúñ]/.test(password); // Incluye letras con acento y ñ minúscula
    const hasDigit = /\d/.test(password); // Verifica si contiene al menos un dígito
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasDigit;
};
        
module.exports = { Password };