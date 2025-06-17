"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitlementSchema = exports.accountSchema = exports.employeeContactSchema = exports.signinSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.signinSchema = joi_1.default.object({
    username: joi_1.default.string()
        .min(6)
        .max(20)
        .required()
        .messages({
        'string.base': 'Username must be a string.',
        'string.empty': 'Username is required.',
        'string.min': 'Username must be at least 6 characters.',
        'string.max': 'Username must be at most 20 characters.',
        'any.required': 'Username is required.'
    }),
    password: joi_1.default.string()
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        .messages({
        'string.pattern.base': 'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
        'string.empty': 'Password is required.',
        'any.required': 'Password is required.'
    })
});
exports.employeeContactSchema = joi_1.default.object({
    work_email: joi_1.default.string()
        .min(6)
        .max(60)
        .required()
        .trim()
        .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov'] } })
        .messages({
        'string.min': 'Email must be at least 6 characters long',
        'string.max': 'Email must not exceed 60 characters',
        'string.email': 'Please provide a valid email address (e.g., user@example.com)',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    phone: joi_1.default.string()
        .min(10)
        .max(20)
        .required()
        .trim()
        .pattern(/^\+?1?\s*[-.]?\s*(\d{3}|\(\d{3}\))\s*[-.]?\s*\d{3}\s*[-.]?\s*\d{4}$/)
        .messages({
        'string.min': 'Phone number must be at least 10 characters long',
        'string.max': 'Phone number must not exceed 20 characters',
        'string.pattern.base': 'Please provide a valid phone number (e.g., +1-555-123-4567, (555) 123-4567, 555-123-4567)',
        'string.empty': 'Phone number is required',
        'any.required': 'Phone number is required',
    }),
});
exports.accountSchema = joi_1.default.object({
    username: joi_1.default.string()
        .min(6)
        .max(20)
        .required()
        .messages({
        'string.base': 'Username must be a string.',
        'string.empty': 'Username is required.',
        'string.min': 'Username must be at least 6 characters.',
        'string.max': 'Username must be at most 20 characters.',
        'any.required': 'Username is required.'
    }),
    password: joi_1.default.string()
        .optional()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        .messages({
        'string.pattern.base': 'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
        'string.empty': 'Password is required.',
        'any.required': 'Password is required.'
    }),
    confirmPassword: joi_1.default.string()
        .min(7)
        .optional()
        .trim()
        .valid(joi_1.default.ref('password'))
        .messages({
        'string.empty': 'Confirm password is required',
        'string.min': 'Confirm password must be at least 7 characters long',
        'any.only': 'Confirm password must match password',
    }),
    role: joi_1.default.string().required().trim().messages({
        'string.empty': 'Role is required',
    }),
    status: joi_1.default.string().required().trim().messages({
        'string.empty': 'Status is required',
    }),
});
exports.entitlementSchema = joi_1.default.object({
    leaveType: joi_1.default.string().required().trim().messages({
        'string.empty': 'Leave type is required',
    }),
    leavePeriod: joi_1.default.number().required().required().messages({
        'any.required': 'Leave period is required',
    }),
    entitlement: joi_1.default.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required',
    }),
});
