"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAccount = exports.updateAccount = exports.deleteAccount = exports.searchAccount = exports.addAccount = void 0;
const database_1 = __importDefault(require("../config/database"));
const validator_1 = require("../middlewares/validator");
const hashing_1 = require("../utils/hashing");
const addAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, employeeName, status, username, password, confirmPassword } = req.body;
    try {
        const { error } = validator_1.accountSchema.validate({ username, password, confirmPassword, role, status }, { abortEarly: false });
        if (error) {
            res.status(400).json({
                success: false,
                message: error.details
                    .map((err) => err.message)
                    .join(', '),
            });
            return;
        }
        const [existingUser] = yield database_1.default.query('SELECT id FROM employee WHERE full_name = ?', [employeeName]);
        if (existingUser.length <= 0) {
            res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
            return;
        }
        const [existingAccount] = yield database_1.default.query('SELECT id FROM account WHERE username = ?', [username]);
        if (existingAccount.length > 0) {
            res.status(409).json({
                success: false,
                message: 'Username already exists',
            });
            return;
        }
        const hashedPassword = yield hashing_1.doHash;
        const [result] = yield database_1.default.query('INSERT INTO account (username, password, role, status, employee_id) VALUES (?, ?, ?, ?, ?)', [username, hashedPassword, role, status, existingUser[0].id]);
        res.status(201).json({
            success: true,
            message: 'Account added successfully',
        });
    }
    catch (error) {
        console.error('Add account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add account',
        });
    }
});
exports.addAccount = addAccount;
const searchAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, role, employee_name, status } = req.body;
    try {
        let sql = `
            SELECT a.id, a.username, a.role, a.status, e.full_name
            FROM account a
            LEFT JOIN employee e ON a.employee_id = e.id
            WHERE 1=1
        `;
        const params = [];
        if (username) {
            sql += ' AND a.username LIKE ?';
            params.push(`%${username}%`);
        }
        if (role) {
            sql += ' AND a.role = ?';
            params.push(role);
        }
        if (employee_name) {
            sql += ' AND e.full_name LIKE ?';
            params.push(`%${employee_name}%`);
        }
        if (status) {
            sql += ' AND a.status = ?';
            params.push(status);
        }
        const [users] = yield database_1.default.query(sql, params);
        if (users.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No users found matching the criteria',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Accounts found successfully',
            data: users,
        });
    }
    catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search account',
        });
    }
});
exports.searchAccount = searchAccount;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountId } = req.params;
    try {
        const [existingAccount] = yield database_1.default.query('SELECT id FROM account WHERE id = ?', [accountId]);
        console.log(existingAccount.length);
        if (existingAccount.length <= 0) {
            res.status(409).json({
                success: false,
                message: 'Account not found!',
            });
            return;
        }
        const [accountResult] = yield database_1.default.query('DELETE FROM account WHERE id = ?', [accountId]);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    }
    catch (error) {
        console.log('Delete account error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account',
        });
    }
});
exports.deleteAccount = deleteAccount;
const updateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { changePassword, accountId, role, employeeName, status, username, password, confirmPassword, } = req.body;
    try {
        if (changePassword === 'yes') {
            const { error } = validator_1.accountSchema.validate({ username, password, confirmPassword, role, status }, { abortEarly: false });
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error.details
                        .map((err) => err.message)
                        .join(', '),
                });
                return;
            }
            const [existingUser] = yield database_1.default.query('SELECT id FROM employee WHERE full_name = ?', [employeeName]);
            if (existingUser.length <= 0) {
                res.status(404).json({
                    success: false,
                    message: 'Employee not found',
                });
                return;
            }
            const hashedPassword = yield (0, hashing_1.doHash)(password, 10);
            const [accountResult] = yield database_1.default.query(`UPDATE account SET username = ?, password = ?, role = ?, status = ?, employee_id = ? WHERE id = ?`, [username, hashedPassword, role, status, existingUser[0].id, accountId]);
            res.status(201).json({
                success: true,
                message: 'Account updated successfully',
            });
            return;
        }
        const { error } = validator_1.accountSchema.validate({ username, role, status }, { abortEarly: false });
        if (error) {
            res.status(400).json({
                success: false,
                message: error.details
                    .map((err) => err.message)
                    .join(', '),
            });
            return;
        }
        const [existingUser] = yield database_1.default.query('SELECT id FROM employee WHERE full_name = ?', [employeeName]);
        if (existingUser.length <= 0) {
            res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
            return;
        }
        const [accountResult] = yield database_1.default.query(`UPDATE account SET username = ?, role = ?, status = ?, employee_id = ? WHERE id = ?`, [username, role, status, existingUser[0].id, accountId]);
        res.status(201).json({
            success: true,
            message: 'Account updated successfully',
        });
    }
    catch (error) {
        console.log('Update account error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to update account',
        });
    }
});
exports.updateAccount = updateAccount;
const getAllAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield database_1.default.query('SELECT * FROM account');
        if (result.length === 0) {
            res.status(404).json({
                success: false,
                message: 'There is no account!',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Get all account success',
            data: result,
        });
    }
    catch (error) {
        console.log('Get account error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to get account list',
        });
    }
});
exports.getAllAccount = getAllAccount;
