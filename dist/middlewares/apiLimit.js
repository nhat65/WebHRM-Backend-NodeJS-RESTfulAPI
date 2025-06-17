"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveAssignLimiter = exports.entitlementAddLimiter = exports.accountAddLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.accountAddLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu tạo tài khoản, vui lòng thử lại sau 1 giờ.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.entitlementAddLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu thêm quyền lợi, vui lòng thử lại sau 15 phút.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.leaveAssignLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu gán ngày nghỉ, vui lòng thử lại sau 15 phút.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
