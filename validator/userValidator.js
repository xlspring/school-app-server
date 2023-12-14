const { body } = require('express-validator');

exports.loginValidator = [
  body('phone')
    .isMobilePhone('uk-UA').withMessage('Invalid phone number'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password should beat least 6 characters long'),
];