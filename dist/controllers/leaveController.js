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
exports.getIndividualLeave = exports.getAllLeave = exports.assignLeave = void 0;
const database_1 = __importDefault(require("../config/database"));
const assignLeave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { employeeName, leaveType, fromDate, toDate, comments } = req.body;
    try {
        const [employee] = yield database_1.default.query('SELECT id FROM employee WHERE full_name = ?', [employeeName]);
        if (employee.length === 0) {
            res.status(404).json({ success: false, message: 'There is no user!' });
            return;
        }
        const [entitlement] = yield database_1.default.query(`SELECT
        en.id,
        en.entitlement,
        lp.start_date,
        lp.end_date
        FROM entitlement en
        JOIN leave_period lp ON en.leave_period_id = lp.id
        WHERE employee_id = ?`, [employee[0].id]);
        if (entitlement.length === 0) {
            res
                .status(404)
                .json({ success: false, message: 'There is no entitlement!' });
            return;
        }
        const entitlementInfo = entitlement[0];
        const { id: entitlementId, entitlement: totalDays, start_date, end_date, } = entitlementInfo;
        const requestFromDate = new Date(fromDate);
        const requestToDate = new Date(toDate);
        const periodStartDate = new Date(start_date);
        const periodEndDate = new Date(end_date);
        if (requestFromDate < periodStartDate || requestToDate > periodEndDate) {
            res.status(400).json({
                success: false,
                message: 'Requested leave dates are outside the entitlement period.',
            });
            return;
        }
        const oneDay = 24 * 60 * 60 * 1000;
        const daysRequested = Math.round((requestToDate.getTime() - requestFromDate.getTime()) / oneDay) + 1;
        const [usedRecords] = yield database_1.default.query(`SELECT 
       SUM(DATEDIFF(lr.to_date, lr.from_date) + 1) AS used_days
       FROM leave_record lr
       JOIN entitlement en ON lr.entitlement_id = en.id
       WHERE lr.employee_id = ? AND en.leave_type = ?;
      `, [employee[0].id, leaveType]);
        const usedDays = ((_a = usedRecords[0]) === null || _a === void 0 ? void 0 : _a.used_days) || 0;
        const remainingDays = totalDays - usedDays;
        if (daysRequested > remainingDays) {
            res.status(400).json({
                success: false,
                message: `Not enough leave balance. Requested ${daysRequested} days, but only ${remainingDays} days remain.`,
            });
            return;
        }
        const [leaveResult] = yield database_1.default.query('INSERT INTO leave_record (employee_id, entitlement_id, from_date, to_date, comments, status) VALUES (?, ?, ?, ?, ?, ?)', [employee[0].id, entitlementId, fromDate, toDate, comments, 'scheduled']);
        res.status(201).json({
            success: true,
            message: 'Leave assigned successfully',
        });
    }
    catch (error) {
        console.log('Assign leave error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign leave',
        });
    }
});
exports.assignLeave = assignLeave;
const getAllLeave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield database_1.default.query(`SELECT
        em.full_name,
        en.leave_type,
        DATEDIFF(lr.to_date, lr.from_date) + 1 AS number_of_days,
        lr.status,
        lr.comments
      FROM leave_record lr
      JOIN employee em ON lr.employee_id = em.id
      JOIN entitlement en ON lr.entitlement_id = en.id`);
        if (result.length === 0) {
            res.status(404).json({
                success: false,
                message: 'There is no leave!',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Get all leave success',
            data: result,
        });
    }
    catch (error) {
        console.log('Get leave error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to get leave list',
        });
    }
});
exports.getAllLeave = getAllLeave;
const getIndividualLeave = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const employeeId = user.employeeId;
    try {
        const [result] = yield database_1.default.query(`SELECT
        em.full_name,
        en.leave_type,
        DATEDIFF(lr.to_date, lr.from_date) + 1 AS number_of_days,
        lr.status,
        lr.comments
      FROM leave_record lr
      JOIN employee em ON lr.employee_id = em.id
      JOIN entitlement en ON lr.entitlement_id = en.id
      WHERE lr.employee_id = ?`, [employeeId]);
        if (result.length === 0) {
            res.status(404).json({
                success: false,
                message: 'There is no leave!',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Get all leave success',
            data: result,
        });
    }
    catch (error) {
        console.log('Get leave error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to get leave list',
        });
    }
});
exports.getIndividualLeave = getIndividualLeave;
