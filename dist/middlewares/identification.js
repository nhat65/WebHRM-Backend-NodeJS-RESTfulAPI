"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifier = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const identifier = (req, res, next) => {
    let token;
    if (req.headers.client === 'not-browser') {
        const authHeader = req.headers.authorization;
        if (typeof authHeader === 'string') {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                token = parts[1];
            }
        }
    }
    else {
        token = req.cookies['Authorization'];
    }
    if (!token) {
        res.status(403).json({ success: false, message: 'Unauthorized: No token provided' });
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(500).json({ success: false, message: 'Server configuration error' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log('Identifier error: ' + error.message);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
exports.identifier = identifier;
