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
exports.updateEmployeeJob = exports.updateEmployeeContact = exports.updateEmployee = exports.deleteEmployee = exports.addEmployee = exports.getEmployeeJob = exports.getEmployeeContact = exports.getEmployee = exports.getAllEmployee = void 0;
const database_1 = __importDefault(require("../config/database"));
const validator_1 = require("../middlewares/validator");
const getAllEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [result] = yield database_1.default.query('SELECT * FROM employee');
        if (result.length === 0) {
            res.status(404).json({ success: false, message: 'There is no user!' });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: 'Get all user success', data: result });
    }
    catch (error) {
        console.log('Get user error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to get employee list',
        });
    }
});
exports.getAllEmployee = getAllEmployee;
const getEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId } = req.params;
    try {
        const [result] = yield database_1.default.query('SELECT * FROM employee WHERE id = ?', [employeeId]);
        if (result.length === 0) {
            res.status(404).json({ success: false, message: 'There is no user!' });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: 'Get user success', data: result });
    }
    catch (error) {
        console.log('Get user error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to get employee',
        });
    }
});
exports.getEmployee = getEmployee;
const getEmployeeContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId } = req.params;
    try {
        const [result] = yield database_1.default.query('SELECT * FROM contact WHERE employee_id = ?', [employeeId]);
        if (result.length === 0) {
            res.status(404).json({ success: false, message: 'There is no user!' });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: 'Get user success', data: result });
    }
    catch (error) {
        console.log('Get user error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to get employee contact',
        });
    }
});
exports.getEmployeeContact = getEmployeeContact;
const getEmployeeJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId } = req.params;
    try {
        const [result] = yield database_1.default.query('SELECT * FROM job WHERE employee_id = ?', [employeeId]);
        if (result.length === 0) {
            res.status(404).json({ success: false, message: 'There is no user!' });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: 'Get user success', data: result });
    }
    catch (error) {
        console.log('Get user error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to get employee job',
        });
    }
});
exports.getEmployeeJob = getEmployeeJob;
const addEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, middleName, lastName, employeeID } = req.body;
    const fullName = `${firstName} ${middleName} ${lastName}`.trim();
    try {
        const [existingUser] = yield database_1.default.query('SELECT id FROM employee WHERE id = ?', [employeeID]);
        if (existingUser.length > 0) {
            res.status(400).json({ message: 'ID is existed' });
            return;
        }
        const [result] = yield database_1.default.query('INSERT INTO employee (full_name, id) VALUES (?, ?)', [fullName, employeeID]);
        yield database_1.default.query('INSERT INTO contact (employee_id) VALUES (?)', [employeeID]);
        yield database_1.default.query('INSERT INTO job (employee_id) VALUES (?)', [employeeID]);
        res
            .status(201)
            .json({ success: true, message: 'Add employee successfully!' });
    }
    catch (error) {
        console.log('Add employee error: ' + error);
        res.status(500).json({
            success: false,
            message: 'Failed to add employee',
        });
    }
});
exports.addEmployee = addEmployee;
const deleteEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId } = req.params;
    try {
        const [user] = yield database_1.default.query('SELECT * FROM employee WHERE id = ?', [employeeId]);
        if (user.length === 0) {
            res.status(404).json({ success: false, error: 'Employee not found' });
            return;
        }
        yield database_1.default.query('START TRANSACTION');
        try {
            yield database_1.default.query('DELETE FROM account WHERE employee_id = ?', [employeeId]);
            yield database_1.default.query('DELETE FROM leave_record WHERE employee_id = ?', [employeeId]);
            yield database_1.default.query('DELETE FROM entitlement WHERE employee_id = ?', [employeeId]);
            yield database_1.default.query('DELETE FROM job WHERE employee_id = ?', [employeeId]);
            yield database_1.default.query('DELETE FROM contact WHERE employee_id = ?', [employeeId]);
            yield database_1.default.query('DELETE FROM employee WHERE id = ?', [employeeId]);
            yield database_1.default.query('COMMIT');
            res.status(200).json({
                success: true,
                message: `Employee and all dependent information deleted successfully`,
            });
        }
        catch (error) {
            yield database_1.default.query('ROLLBACK');
            throw error;
        }
    }
    catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete employee and associated accounts',
        });
    }
});
exports.deleteEmployee = deleteEmployee;
const updateEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId, full_name, nationality, marital_status, date_of_birth, gender, picture, } = req.body;
    try {
        const [employees] = yield database_1.default.query('SELECT * FROM employee WHERE id = ?', [employeeId]);
        if (employees.length === 0) {
            res.status(404).json({ success: false, error: 'Employee not found' });
            return;
        }
        const updates = {};
        if (full_name !== undefined)
            updates.full_name = full_name;
        if (nationality !== undefined)
            updates.nationality = nationality;
        if (marital_status !== undefined)
            updates.marital_status = marital_status;
        if (date_of_birth !== undefined)
            updates.date_of_birth = date_of_birth;
        if (gender !== undefined)
            updates.gender = gender;
        if (picture !== undefined)
            updates.picture = picture;
        if (Object.keys(updates).length === 0) {
            res
                .status(400)
                .json({ success: false, error: 'No valid fields provided for update' });
            return;
        }
        const fields = Object.keys(updates)
            .map((field) => `${field} = ?`)
            .join(', ');
        const values = Object.values(updates).concat(employeeId);
        const [result] = yield database_1.default.query(`UPDATE employee SET ${fields} WHERE id = ?`, values);
        if (result.affectedRows === 0) {
            res
                .status(500)
                .json({ success: false, error: 'Failed to update employee' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
        });
    }
    catch (error) {
        console.error('Update employee error:', error);
        res
            .status(500)
            .json({ success: false, error: 'Failed to update employee' });
    }
});
exports.updateEmployee = updateEmployee;
const updateEmployeeContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId, address, phone, work_email, other_email } = req.body;
    try {
        const { error } = validator_1.employeeContactSchema.validate({ work_email, phone }, { abortEarly: false });
        if (error) {
            res.status(401).json({
                success: false,
                message: error.details
                    .map((err) => err.message)
                    .join(', '),
            });
            return;
        }
        const [employees] = yield database_1.default.query('SELECT * FROM employee WHERE id = ?', [employeeId]);
        if (employees.length === 0) {
            res.status(404).json({ success: false, error: 'Employee not found' });
            return;
        }
        const updates = {};
        if (address !== undefined)
            updates.address = address;
        if (phone !== undefined)
            updates.phone = phone;
        if (work_email !== undefined)
            updates.work_email = work_email;
        if (other_email !== undefined)
            updates.other_email = other_email;
        if (Object.keys(updates).length === 0) {
            res
                .status(400)
                .json({ success: false, error: 'No valid fields provided for update' });
            return;
        }
        const fields = Object.keys(updates)
            .map((field) => `${field} = ?`)
            .join(', ');
        const values = Object.values(updates).concat(employeeId);
        const [result] = yield database_1.default.query(`UPDATE contact SET ${fields} WHERE employee_id = ?`, values);
        if (result.affectedRows === 0) {
            res
                .status(500)
                .json({ success: false, error: 'Failed to update employee' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Employee contact updated successfully',
        });
    }
    catch (error) {
        console.error('Update employee contact error:', error);
        res
            .status(500)
            .json({ success: false, error: 'Failed to update employee contact' });
    }
});
exports.updateEmployeeContact = updateEmployeeContact;
const updateEmployeeJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId, joined_date, job_title, sub_unit, location, job_category_id, employment_status, } = req.body;
    try {
        const [employees] = yield database_1.default.query('SELECT * FROM employee WHERE id = ?', [employeeId]);
        if (employees.length === 0) {
            res.status(404).json({ success: false, error: 'Employee not found' });
            return;
        }
        const updates = {};
        if (joined_date !== undefined)
            updates.joined_date = joined_date;
        if (job_title !== undefined)
            updates.job_title = job_title;
        if (sub_unit !== undefined)
            updates.sub_unit = sub_unit;
        if (location !== undefined)
            updates.location = location;
        if (job_category_id !== undefined)
            updates.job_category_id = job_category_id;
        if (employment_status !== undefined)
            updates.employment_status = employment_status;
        if (Object.keys(updates).length === 0) {
            res
                .status(400)
                .json({ success: false, error: 'No valid fields provided for update' });
            return;
        }
        const fields = Object.keys(updates)
            .map((field) => `${field} = ?`)
            .join(', ');
        const values = Object.values(updates).concat(employeeId);
        const [result] = yield database_1.default.query(`UPDATE job SET ${fields} WHERE employee_id = ?`, values);
        if (result.affectedRows === 0) {
            res
                .status(500)
                .json({ success: false, error: 'Failed to update employee' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Employee job updated successfully',
        });
    }
    catch (error) {
        console.error('Update employee job error:', error);
        res
            .status(500)
            .json({ success: false, error: 'Failed to update employee job' });
    }
});
exports.updateEmployeeJob = updateEmployeeJob;
