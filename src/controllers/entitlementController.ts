import { Request, Response } from 'express';
import pool from '../config/database';
import { entitlementSchema } from '../middlewares/validator';
import { extend, ValidationErrorItem } from 'joi';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

//Interface for entitlement data
interface Entitlement extends RowDataPacket {
  id: number;
  leave_type: string;
  entitlement: number;
  employee_id: string;
  leave_period: number;
}

interface EntitlementInfor extends RowDataPacket {
  id: number;
  leave_type: string;
  entitlement: number;
  full_name: string;
  start_date: string;
  end_date: string;
  employee_id: string;
}

interface Employee extends RowDataPacket {
  id: string;
  full_name: string;
}

interface EmployeeId extends RowDataPacket {
  employee_id: string;
}

//Add entitlement
export const addEntitlement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    action,
    employeeName,
    location,
    subUnit,
    leaveType,
    leavePeriod,
    entitlement,
  } = req.body as {
    action: string;
    employeeName?: string;
    location?: string;
    subUnit?: string;
    leaveType: string;
    leavePeriod: number;
    entitlement: number;
  };
  try {
    const { error } = entitlementSchema.validate(
      { leaveType, leavePeriod, entitlement },
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
    if (action == 'individual') {
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

      // Insert into entitlement table
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO entitlement (leave_type, entitlement, employee_id, leave_period_id) VALUES (?, ?, ?, ?)',
        [leaveType, entitlement, existingUser[0].id, leavePeriod],
      );

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
      const params: any[] = [];

      //Add conditions
      if (location) {
        sql += ' AND location = ?';
        params.push(location);
      }
      if (subUnit) {
        sql += ' AND sub_unit = ?';
        params.push(subUnit);
      }

      // Check if employee exists
      const [existingUsers] = await pool.query<EmployeeId[]>(sql, params);

      if (existingUsers.length <= 0) {
        res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
        return;
      }

      // Insert into entitlement table for multiple employees
      const employeeIds = existingUsers.map((user) => user.employee_id);
      const values = employeeIds.map((employeeId) => [
        leaveType,
        entitlement,
        employeeId,
        leavePeriod,
      ]);

      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO entitlement (leave_type, entitlement, employee_id, leave_period_id) VALUES ?',
        [values],
      );
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
  } catch (error: any) {
    console.log('Add entitlement error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to add entitlements',
    });
  }
};

//Get all entitlement
export const getAllEntitlement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [result] = await pool.query<EntitlementInfor[]>(`SELECT 
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
  } catch (error: any) {
    console.error('Get all entitlement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all entitlement',
    });
  }
};

//Get entitlement
export const getEntitlement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { entitlementId } = req.params as { entitlementId: string };
  try {
    const [result] = await pool.query<EntitlementInfor[]>(
      `SELECT 
      em.full_name,
      en.leave_type,
      lp.start_date,
      lp.end_date,
      en.entitlement
      FROM entitlement en
      JOIN employee em ON en.employee_id = em.id
JOIN leave_period lp ON en.leave_period_id = lp.id 
WHERE en.id = ?`,
      [entitlementId],
    );
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
  } catch (error: any) {
    console.log('Get entitlement error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee',
    });
  }
};

//Update entitlement
export const updateEntitlement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { entitlementId, leavePeriod, entitlement } = req.body as {
    entitlementId: number;
    leavePeriod: number;
    entitlement: number;
  };

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE entitlement 
      SET leave_period_id = ?, entitlement = ?
      WHERE id = ?`,
      [leavePeriod, entitlement, entitlementId],
    );

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
  } catch (error: any) {
    console.error('Update entitlement error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to update entitlement' });
  }
};
