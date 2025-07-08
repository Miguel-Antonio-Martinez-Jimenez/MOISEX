// backend/src/validations/phonenumber.validation.js
const PhoneNumber = (phoneNumber) => 
{
    const regex = /^\+[1-9]{1,3}[0-9]{9,14}$/; // Formato internacional con código de país
    return regex.test(phoneNumber);
};

module.exports = { PhoneNumber };