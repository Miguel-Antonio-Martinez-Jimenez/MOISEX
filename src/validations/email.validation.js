// backend/src/validations/email.validation.js
const Email = (email) => 
{
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
    
module.exports = { Email };