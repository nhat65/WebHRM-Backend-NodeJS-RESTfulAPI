"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doHashValidation = exports.doHash = void 0;
const bcryptjs_1 = require("bcryptjs");
const doHash = (value, saltValue) => {
    return (0, bcryptjs_1.hash)(value, saltValue);
};
exports.doHash = doHash;
const doHashValidation = (value, hashedValue) => {
    return (0, bcryptjs_1.compare)(value, hashedValue);
};
exports.doHashValidation = doHashValidation;
