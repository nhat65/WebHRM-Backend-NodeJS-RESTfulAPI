import { Request, Response } from 'express';
import pool from '../config/database';
import { accountSchema } from '../middlewares/validator';
import { ValidationErrorItem } from 'joi';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { doHash } from '../utils/hashing'

// Interface for account data
interface Account extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  role: string;
  status: string;
  employee_id: string;
}

// Interface for employee data
interface Employee extends RowDataPacket {
  id?: string;
  full_name?: string;
}

// Interface for account search result
interface AccountSearchResult extends RowDataPacket {
  id: number;
  username: string;
  role: string;
  status: string;
  full_name: string;
}

// Add account
export const addAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { role, employeeName, status, username, password, confirmPassword } =
    req.body as {
      role: string;
      employeeName: string;
      status: string;
      username: string;
      password: string;
      confirmPassword: string;
    };

  try {
    // Validate input using Joi schema
    const { error } = accountSchema.validate(
      { username, password, confirmPassword, role, status },
      { abortEarly: false },
    );
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details
          .map((err: ValidationErrorItem) => err.message)
          .join(', '),
      });
      return;
    }

    // Check if employee exists
    const [existingUser] = await pool.query<Employee[]>(
      'SELECT id FROM employee WHERE full_name = ?',
      [employeeName],
    );
    if (existingUser.length <= 0) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    // Check if username is already taken
    const [existingAccount] = await pool.query<Account[]>(
      'SELECT id FROM account WHERE username = ?',
      [username],
    );
    if (existingAccount.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await doHash

    // Insert into accounts table
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO account (username, password, role, status, employee_id) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, role, status, existingUser[0].id],
    );

    res.status(201).json({
      success: true,
      message: 'Account added successfully',
    });
  } catch (error: any) {
    console.error('Add account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add account',
    });
  }
};

// Search account
export const searchAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { username, role, employee_name, status } = req.body as {
    username?: string;
    role?: string;
    employee_name?: string;
    status?: string;
  };

  try {
    // Build dynamic query
    let sql = `
            SELECT a.id, a.username, a.role, a.status, e.full_name
            FROM account a
            LEFT JOIN employee e ON a.employee_id = e.id
            WHERE 1=1
        `;
    const params: any[] = [];

    // Add conditions for provided fields
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

    // Execute query
    const [users] = await pool.query<AccountSearchResult[]>(sql, params);

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
  } catch (error: any) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search account',
    });
  }
};

// Delete account
export const deleteAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { accountId } = req.params as { accountId: string };

  try {
    // Check existing user
    const [existingAccount] = await pool.query<Account[]>(
      'SELECT id FROM account WHERE id = ?',
      [accountId],
    );
    console.log(existingAccount.length);
    if (existingAccount.length <= 0) {
      res.status(409).json({
        success: false,
        message: 'Account not found!',
      });
      return;
    }

    const [accountResult] = await pool.query<ResultSetHeader>(
      'DELETE FROM account WHERE id = ?',
      [accountId],
    );

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    console.log('Delete account error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
};

// Update account
export const updateAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    changePassword,
    accountId,
    role,
    employeeName,
    status,
    username,
    password,
    confirmPassword,
  } = req.body as {
    changePassword: string;
    accountId: number;
    role: string;
    employeeName: string;
    status: string;
    username: string;
    password?: string;
    confirmPassword?: string;
  };

  try {
    // Check if option change password is selected
    if (changePassword === 'yes') {
      const { error } = accountSchema.validate(
        { username, password, confirmPassword, role, status },
        { abortEarly: false },
      );
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details
            .map((err: ValidationErrorItem) => err.message)
            .join(', '),
        });
        return;
      }

      // Check if employee exists
      const [existingUser] = await pool.query<Employee[]>(
        'SELECT id FROM employee WHERE full_name = ?',
        [employeeName],
      );
      if (existingUser.length <= 0) {
        res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
        return;
      }

      // Hash the new password
      const hashedPassword = await doHash(password!, 10)

      const [accountResult] = await pool.query<ResultSetHeader>(
        `UPDATE account SET username = ?, password = ?, role = ?, status = ?, employee_id = ? WHERE id = ?`,
        [username, hashedPassword, role, status, existingUser[0].id, accountId],
      );

      res.status(201).json({
        success: true,
        message: 'Account updated successfully',
      });
      return;
    }

    // If update with no change password
    const { error } = accountSchema.validate(
      { username, role, status },
      { abortEarly: false },
    );
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details
          .map((err: ValidationErrorItem) => err.message)
          .join(', '),
      });
      return;
    }

    // Check if employee exists
    const [existingUser] = await pool.query<Employee[]>(
      'SELECT id FROM employee WHERE full_name = ?',
      [employeeName],
    );
    if (existingUser.length <= 0) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    const [accountResult] = await pool.query<ResultSetHeader>(
      `UPDATE account SET username = ?, role = ?, status = ?, employee_id = ? WHERE id = ?`,
      [username, role, status, existingUser[0].id, accountId],
    );

    res.status(201).json({
      success: true,
      message: 'Account updated successfully',
    });
  } catch (error: any) {
    console.log('Update account error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to update account',
    });
  }
};

// Get list account
export const getAllAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [result] = await pool.query<Account[]>('SELECT * FROM account');
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
  } catch (error: any) {
    console.log('Get account error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to get account list',
    });
  }
};
