import Joi from 'joi';

// Interface for signin data
interface Signin {
    username: string;
    password: string;
}

// Interface for accept code data
interface AcceptCode {
    email: string;
    providedCode: number;
}

// Interface for employee contact data
interface EmployeeContact {
    work_email: string;
    phone: string;
}

// Interface for account data
interface Account {
    username: string;
    password?: string;
    confirmPassword?: string;
    role: string;
    status: string;
}

// Interface for entitlement data
interface Entitlement {
    leaveType: string;
    leavePeriod: string;
    entitlement: number;
}

export const signinSchema = Joi.object<Signin>({
    username: Joi.string()
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
  password: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    })
});

export const employeeContactSchema = Joi.object<EmployeeContact>({
    work_email: Joi.string()
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
    phone: Joi.string()
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

export const accountSchema = Joi.object<Account>({
    username: Joi.string()
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
  password: Joi.string()
    .optional()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
      'string.empty': 'Password is required.',
      'any.required': 'Password is required.'
    }),
    confirmPassword: Joi.string()
        .min(7)
        .optional()
        .trim()
        .valid(Joi.ref('password'))
        .messages({
            'string.empty': 'Confirm password is required',
            'string.min': 'Confirm password must be at least 7 characters long',
            'any.only': 'Confirm password must match password',
        }),
    role: Joi.string().required().trim().messages({
        'string.empty': 'Role is required',
    }),
    status: Joi.string().required().trim().messages({
        'string.empty': 'Status is required',
    }),
});

export const entitlementSchema = Joi.object<Entitlement>({
    leaveType: Joi.string().required().trim().messages({
        'string.empty': 'Leave type is required',
    }),
    leavePeriod: Joi.number().required().required().messages({
        'any.required': 'Leave period is required',
    }),
    entitlement: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required',
    }),
});