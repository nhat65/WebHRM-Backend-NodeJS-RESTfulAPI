import rateLimit from 'express-rate-limit';

//Rate limit of authentication
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30, 
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

//Rate limit of add account
export const accountAddLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu tạo tài khoản, vui lòng thử lại sau 1 giờ.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

//Rate limit of entitlement
export const entitlementAddLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50, 
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu thêm quyền lợi, vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


//Rate limit of assign leave
export const leaveAssignLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu gán ngày nghỉ, vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
