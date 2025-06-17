import { Request, Response } from 'express';
import pool from '../config/database';
import { employeeContactSchema } from '../middlewares/validator';
import { ValidationErrorItem } from 'joi';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// Interface for employee data
interface Employee extends RowDataPacket {
  id: string;
  full_name: string;
  nationality?: string;
  marital_status?: string;
  date_of_birth?: string;
  gender?: string;
  picture?: string;
}

// Interface for contact data
interface Contact extends RowDataPacket {
  employee_id: string;
  address?: string;
  phone?: string;
  work_email?: string;
  other_email?: string;
}

// Interface for job data
interface Job extends RowDataPacket {
  employee_id: string;
  joined_date?: string;
  job_title?: string;
  sub_unit?: string;
  location?: string;
  job_category_id?: string;
  employment_status?: string;
}

// Get all employees
export const getAllEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [result] = await pool.query<Employee[]>('SELECT * FROM employee');
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'There is no user!' });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: 'Get all user success', data: result });
  } catch (error: any) {
    console.log('Get user error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee list',
    });
  }
};

// Get employee
export const getEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { employeeId } = req.params as { employeeId: string };
  try {
    const [result] = await pool.query<Employee[]>(
      'SELECT * FROM employee WHERE id = ?',
      [employeeId],
    );
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'There is no user!' });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: 'Get user success', data: result });
  } catch (error: any) {
    console.log('Get user error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee',
    });
  }
};

// Get employee contact
export const getEmployeeContact = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { employeeId } = req.params as { employeeId: string };
  try {
    const [result] = await pool.query<Contact[]>(
      'SELECT * FROM contact WHERE employee_id = ?',
      [employeeId],
    );
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'There is no user!' });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: 'Get user success', data: result });
  } catch (error: any) {
    console.log('Get user error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee contact',
    });
  }
};

// Get employee job
export const getEmployeeJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { employeeId } = req.params as { employeeId: string };
  try {
    const [result] = await pool.query<Job[]>(
      'SELECT * FROM job WHERE employee_id = ?',
      [employeeId],
    );
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'There is no user!' });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: 'Get user success', data: result });
  } catch (error: any) {
    console.log('Get user error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee job',
    });
  }
};

// Add employee
export const addEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { firstName, middleName, lastName, employeeID } = req.body as {
    firstName: string;
    middleName: string;
    lastName: string;
    employeeID: string;
  };
  const fullName = `${firstName} ${middleName} ${lastName}`.trim();

  try {
    
    const [existingUser] = await pool.query<Employee[]>(
      'SELECT id FROM employee WHERE id = ?',
      [employeeID],
    );
    if (existingUser.length > 0) {
      res.status(400).json({ message: 'ID is existed' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO employee (full_name, id) VALUES (?, ?)',
      [fullName, employeeID],
    );

    await pool.query<ResultSetHeader>(
      'INSERT INTO contact (employee_id) VALUES (?)',
      [employeeID],
    );

    await pool.query<ResultSetHeader>(
      'INSERT INTO job (employee_id) VALUES (?)',
      [employeeID],
    );

    res
      .status(201)
      .json({ success: true, message: 'Add employee successfully!' });
  } catch (error: any) {
    console.log('Add employee error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to add employee',
    });
  }
};

// Delete employee
export const deleteEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { employeeId } = req.params as { employeeId: string };

  try {
    // Check if employee exists
    const [user] = await pool.query<Employee[]>(
      'SELECT * FROM employee WHERE id = ?',
      [employeeId],
    );
    if (user.length === 0) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }

    // Begin transaction
    await pool.query('START TRANSACTION');

    try {
      // Delete all accounts
      await pool.query<ResultSetHeader>(
        'DELETE FROM account WHERE employee_id = ?',
        [employeeId],
      );

      // Delete all leave record
      await pool.query<ResultSetHeader>(
        'DELETE FROM leave_record WHERE employee_id = ?',
        [employeeId],
      );

      // Delete all entitlement
      await pool.query<ResultSetHeader>(
        'DELETE FROM entitlement WHERE employee_id = ?',
        [employeeId],
      );

      // Delete the job information
      await pool.query<ResultSetHeader>(
        'DELETE FROM job WHERE employee_id = ?',
        [employeeId],
      );

      // Delete the contact information
      await pool.query<ResultSetHeader>(
        'DELETE FROM contact WHERE employee_id = ?',
        [employeeId],
      );

      // Delete the employee
      await pool.query('DELETE FROM employee WHERE id = ?', [employeeId]);

      // Commit transaction
      await pool.query('COMMIT');

      res.status(200).json({
        success: true,
        message: `Employee and all dependent information deleted successfully`,
      });
    } catch (error) {
      // Rollback transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete employee and associated accounts',
    });
  }
};

// Update employee
export const updateEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    employeeId,
    full_name,
    nationality,
    marital_status,
    date_of_birth,
    gender,
    picture,
  } = req.body as Partial<Employee> & { employeeId: string };

  try {
    // Check if employee exists
    const [employees] = await pool.query<Employee[]>(
      'SELECT * FROM employee WHERE id = ?',
      [employeeId],
    );
    if (employees.length === 0) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }

    // Build dynamic query to update only provided fields
    const updates: Partial<Employee> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (nationality !== undefined) updates.nationality = nationality;
    if (marital_status !== undefined) updates.marital_status = marital_status;
    if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
    if (gender !== undefined) updates.gender = gender;
    if (picture !== undefined) updates.picture = picture;

    if (Object.keys(updates).length === 0) {
      res
        .status(400)
        .json({ success: false, error: 'No valid fields provided for update' });
      return;
    }

    // Generate SQL query dynamically
    const fields = Object.keys(updates)
      .map((field) => `${field} = ?`)
      .join(', ');
    const values = Object.values(updates).concat(employeeId);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE employee SET ${fields} WHERE id = ?`,
      values,
    );

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
  } catch (error: any) {
    console.error('Update employee error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to update employee' });
  }
};

// Update employee contact
export const updateEmployeeContact = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { employeeId, address, phone, work_email, other_email } =
    req.body as Partial<Contact> & { employeeId: string };

  try {
    const { error } = employeeContactSchema.validate(
      { work_email, phone },
      { abortEarly: false },
    );

    if (error) {
      res.status(401).json({
        success: false,
        message: error.details
          .map((err: ValidationErrorItem) => err.message)
          .join(', '),
      });
      return;
    }

    // Check if employee exists
    const [employees] = await pool.query<Employee[]>(
      'SELECT * FROM employee WHERE id = ?',
      [employeeId],
    );
    if (employees.length === 0) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }

    // Build dynamic query to update only provided fields
    const updates: Partial<Contact> = {};
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (work_email !== undefined) updates.work_email = work_email;
    if (other_email !== undefined) updates.other_email = other_email;

    if (Object.keys(updates).length === 0) {
      res
        .status(400)
        .json({ success: false, error: 'No valid fields provided for update' });
      return;
    }

    // Generate SQL query dynamically
    const fields = Object.keys(updates)
      .map((field) => `${field} = ?`)
      .join(', ');
    const values = Object.values(updates).concat(employeeId);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE contact SET ${fields} WHERE employee_id = ?`,
      values,
    );

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
  } catch (error: any) {
    console.error('Update employee contact error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to update employee contact' });
  }
};

// Update employee job
export const updateEmployeeJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    employeeId,
    joined_date,
    job_title,
    sub_unit,
    location,
    job_category_id,
    employment_status,
  } = req.body as Partial<Job> & { employeeId: string };

  try {
    // Check if employee exists
    const [employees] = await pool.query<Employee[]>(
      'SELECT * FROM employee WHERE id = ?',
      [employeeId],
    );
    if (employees.length === 0) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }

    // Build dynamic query to update only provided fields
    const updates: Partial<Job> = {};
    if (joined_date !== undefined) updates.joined_date = joined_date;
    if (job_title !== undefined) updates.job_title = job_title;
    if (sub_unit !== undefined) updates.sub_unit = sub_unit;
    if (location !== undefined) updates.location = location;
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

    // Generate SQL query dynamically
    const fields = Object.keys(updates)
      .map((field) => `${field} = ?`)
      .join(', ');
    const values = Object.values(updates).concat(employeeId);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE job SET ${fields} WHERE employee_id = ?`,
      values,
    );

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
  } catch (error: any) {
    console.error('Update employee job error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to update employee job' });
  }
};
