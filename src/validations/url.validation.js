// backend/src/validations/url.validation.js
const validateUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    
    if (!url) {
        return { isValid: false, message: 'URL es requerida' };
    }
    
    if (!regex.test(url)) {
        return { isValid: false, message: 'Formato de URL no válido. Debe comenzar con http:// o https://' };
    }
    
    return { isValid: true, message: 'URL válida' };
};

module.exports = { validateUrl };