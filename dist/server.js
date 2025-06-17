"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const accountRouter_1 = __importDefault(require("./routers/accountRouter"));
const entitlementRouter_1 = __importDefault(require("./routers/entitlementRouter"));
const leaveRouter_1 = __importDefault(require("./routers/leaveRouter"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/user', userRouter_1.default);
app.use('/api/account', accountRouter_1.default);
app.use('/api/entitlement', entitlementRouter_1.default);
app.use('/api/leave', leaveRouter_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'hello' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}...`);
});
