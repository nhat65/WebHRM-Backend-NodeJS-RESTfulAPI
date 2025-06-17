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
exports.updateEntitlement = exports.getEntitlement = exports.getAllEntitlement = exports.addEntitlement = void 0;
const database_1 = __importDefault(require("../config/database"));
const validator_1 = require("../middlewares/validator");
const addEntitlement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { action, employeeName, location, subUnit, leaveType, leavePeriod, entitlement, } = req.body;
    try {
        const { error } = validator_1.entitlementSchema.validate({ leaveType, leavePeriod, entitlement }, { abortEarly: false });
        if (error) {
            res.status(400).json({
                success: false,
                message: error.details
                    .map((err) => err.message)
                    .join(', '),
            });
            return;
        }
        if (action == 'individual') {
            const [existingUser] = yield database_1.default.query('SELECT id FROM employee WHERE full_name = ?', [employeeName]);
            if (existingUser.length <= 0) {
                res.status(404).json({
                    success: false,
                    message: 'Employee not found',
                });
                return;
            }
            const [result] = yield database_1.default.query('INSERT INTO entitlement (leave_type, entitlement, employee_id, leave_period_id) VALUES (?, ?, ?, ?)', [leaveType, entitlement, existingUser[0].id, leavePeriod]);
            res.status(201).json({
                success: true,
                message: 'Entitlement added successfully',
            });
            return;
        }
        if (action == 'multiple') {
            let sql = `
      SELECT employee_id 
      FROM job 
      WHERE 1=1`;
            const params = [];
            if (location) {
                sql += ' AND location = ?';
                params.push(location);
            }
            if (subUnit) {
                sql += ' AND sub_unit = ?';
                params.push(subUnit);
            }
            const [existingUsers] = yield database_1.default.query(sql, params);
            if (existingUsers.length <= 0) {
                res.status(404).json({
                    success: false,
                    message: 'Employee not found',
                });
                return;
            }
            const employeeIds = existingUsers.map((user) => user.employee_id);
            const values = employeeIds.map((employeeId) => [
                leaveType,
                entitlement,
                employeeId,
                leavePeriod,
            ]);
            const [result] = yield database_1.default.query('INSERT INTO entitlement (leave_type, entitlement, employee_id, leave_period_id) VALUES ?', [values]);
            console.log(existingUsers);
            console.log(employeeIds);
            console.log(values);
            res.status(201).json({
                success: true,
                message: `Entitlements have been successfully created for ${result.affectedRows} employees.`,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to add entitlements',
        });
    }
    catch (error) {
        console.log('Add entitlement error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to add entitlements',
        });
    }
});
exports.addEntitlement = addEntitlement;
const getAllEntitlement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield database_1.default.query(`SELECT 
  en.id,
  e.full_name,
  en.leave_type,
  en.entitlement,
  lp.start_date,
  lp.end_date
FROM entitlement en
JOIN employee e ON en.employee_id = e.id
JOIN leave_period lp ON en.leave_period_id = lp.id;
`);
        res
            .status(200)
            .json({
            success: true,
            message: 'Get all entitlement success',
            data: result,
        });
    }
    catch (error) {
        console.error('Get all entitlement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get all entitlement',
        });
    }
});
exports.getAllEntitlement = getAllEntitlement;
const getEntitlement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { entitlementId } = req.params;
    try {
        const [result] = yield database_1.default.query(`SELECT 
      em.full_name,
      en.leave_type,
      lp.start_date,
      lp.end_date,
      en.entitlement
      FROM entitlement en
      JOIN employee em ON en.employee_id = em.id
JOIN leave_period lp ON en.leave_period_id = lp.id 
WHERE en.id = ?`, [entitlementId]);
        if (result.length === 0) {
            res
                .status(404)
                .json({ success: false, message: 'There is no entitlement!' });
            return;
        }
        res
            .status(200)
            .json({
            success: true,
            message: 'Get entitlement success',
            data: result,
        });
    }
    catch (error) {
        console.log('Get entitlement error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to get employee',
        });
    }
});
exports.getEntitlement = getEntitlement;
const updateEntitlement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { entitlementId, leavePeriod, entitlement } = req.body;
    try {
        const [result] = yield database_1.default.query(`UPDATE entitlement 
      SET leave_period_id = ?, entitlement = ?
      WHERE id = ?`, [leavePeriod, entitlement, entitlementId]);
        if (result.affectedRows === 0) {
            res
                .status(500)
                .json({ success: false, error: 'Failed to update entitlement' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Entitlement updated successfully',
        });
    }
    catch (error) {
        console.error('Update entitlement error:', error);
        res
            .status(500)
            .json({ success: false, error: 'Failed to update entitlement' });
    }
});
exports.updateEntitlement = updateEntitlement;
