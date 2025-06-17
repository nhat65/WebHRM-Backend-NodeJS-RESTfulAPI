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
exports.signout = exports.signin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validator_1 = require("../middlewares/validator");
const hashing_1 = require("../utils/hashing");
const database_1 = __importDefault(require("../config/database"));
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const { error } = validator_1.signinSchema.validate({ username, password });
        if (error) {
            res.status(401).json({
                success: false,
                message: error.details[0].message,
            });
            return;
        }
        const [existingAccount] = yield database_1.default.query(`SELECT * FROM account 
      WHERE username = ?`, [username]);
        if (!existingAccount) {
            res.status(401).json({
                success: false,
                message: 'Username does not exist!',
            });
            return;
        }
        const result = yield (0, hashing_1.doHashValidation)(password, existingAccount[0].password);
        if (!result) {
            res.status(401).json({
                success: false,
                message: 'Wrong password!',
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            employeeId: existingAccount[0].employee_id,
            status: existingAccount[0].status,
            role: existingAccount[0].role,
        }, process.env.TOKEN_SECRET, { expiresIn: '8h' });
        res
            .cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
        })
            .json({
            success: true,
            token,
            message: 'Login successfully!',
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
exports.signin = signin;
const signout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .clearCookie('Authorization')
        .status(200)
        .json({ success: true, message: 'Logout successfully!' });
});
exports.signout = signout;
