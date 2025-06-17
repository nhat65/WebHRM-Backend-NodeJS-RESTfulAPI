import { Request, Response } from 'express';
import pool from '../config/database';
import { employeeContactSchema } from '../middlewares/validator';
import { ValidationErrorItem } from 'joi';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { AuthRequest } from '../middlewares/identification';

interface EmployeeId extends RowDataPacket {
  id?: string;
}

interface LeaveRecord extends RowDataPacket {
  used_days?: number;
}

interface EntitlementInfor extends RowDataPacket {
  entitlement: number;
  start_date: string;
  end_date: string;
}

interface Leave extends RowDataPacket {
  full_name: string;
  leave_type: string;
  number_of_days: number;
  status: string;
  comments: string;
}
//Assign leave
export const assignLeave = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { employeeName, leaveType, fromDate, toDate, comments } = req.body as {
    employeeName: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    comments?: string;
  };
  try {
    // Check if employee exists
    const [employee] = await pool.query<EmployeeId[]>(
      'SELECT id FROM employee WHERE full_name = ?',
      [employeeName],
    );
    if (employee.length === 0) {
      res.status(404).json({ success: false, message: 'There is no user!' });
      return;
    }

    //Check employee entitlement
    const [entitlement] = await pool.query<EntitlementInfor[]>(
      `SELECT
        en.id,
        en.entitlement,
        lp.start_date,
        lp.end_date
        FROM entitlement en
        JOIN leave_period lp ON en.leave_period_id = lp.id
        WHERE employee_id = ?`,
      [employee[0].id],
    );
    if (entitlement.length === 0) {
      res
        .status(404)
        .json({ success: false, message: 'There is no entitlement!' });
      return;
    }

    // Check leave balance and date range
    const entitlementInfo = entitlement[0];
    const {
      id: entitlementId,
      entitlement: totalDays,
      start_date,
      end_date,
    } = entitlementInfo;

    // Convert dates to Date objects for comparison
    const requestFromDate = new Date(fromDate);
    const requestToDate = new Date(toDate);
    const periodStartDate = new Date(start_date);
    const periodEndDate = new Date(end_date);

    // Check if dates are within the leave period
    if (requestFromDate < periodStartDate || requestToDate > periodEndDate) {
      res.status(400).json({
        success: false,
        message: 'Requested leave dates are outside the entitlement period.',
      });
      return;
    }

    // Calculate number of days requested
    const oneDay = 24 * 60 * 60 * 1000; // Hours * minutes * seconds * milliseconds
    const daysRequested =
      Math.round(
        (requestToDate.getTime() - requestFromDate.getTime()) / oneDay,
      ) + 1; // Include both start and end dates

    // Query leave_record to calculate used days
    const [usedRecords] = await pool.query<LeaveRecord[]>(
      `SELECT 
       SUM(DATEDIFF(lr.to_date, lr.from_date) + 1) AS used_days
       FROM leave_record lr
       JOIN entitlement en ON lr.entitlement_id = en.id
       WHERE lr.employee_id = ? AND en.leave_type = ?;
      `,
      [employee[0].id, leaveType],
    );
    const usedDays = usedRecords[0]?.used_days || 0;

    const remainingDays = totalDays - usedDays;

    // Check if enough leave balance
    if (daysRequested > remainingDays) {
      res.status(400).json({
        success: false,
        message: `Not enough leave balance. Requested ${daysRequested} days, but only ${remainingDays} days remain.`,
      });
      return;
    }

    const [leaveResult] = await pool.query<ResultSetHeader>(
      'INSERT INTO leave_record (employee_id, entitlement_id, from_date, to_date, comments, status) VALUES (?, ?, ?, ?, ?, ?)',
      [employee[0].id, entitlementId, fromDate, toDate, comments, 'scheduled'],
    );

    res.status(201).json({
      success: true,
      message: 'Leave assigned successfully',
    });
  } catch (error: any) {
    console.log('Assign leave error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign leave',
    });
  }
};

//Get leave list
export const getAllLeave = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [result] = await pool.query<Leave[]>(
      `SELECT
        em.full_name,
        en.leave_type,
        DATEDIFF(lr.to_date, lr.from_date) + 1 AS number_of_days,
        lr.status,
        lr.comments
      FROM leave_record lr
      JOIN employee em ON lr.employee_id = em.id
      JOIN entitlement en ON lr.entitlement_id = en.id`,
    );
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
  } catch (error: any) {
    console.log('Get leave error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave list',
    });
  }
};


//Get leave of user
export const getIndividualLeave = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const employeeId = user.employeeId;
  try {
    const [result] = await pool.query<Leave[]>(
      `SELECT
        em.full_name,
        en.leave_type,
        DATEDIFF(lr.to_date, lr.from_date) + 1 AS number_of_days,
        lr.status,
        lr.comments
      FROM leave_record lr
      JOIN employee em ON lr.employee_id = em.id
      JOIN entitlement en ON lr.entitlement_id = en.id
      WHERE lr.employee_id = ?`,
      [employeeId],
    );
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
  } catch (error: any) {
    console.log('Get leave error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave list',
    });
  }
};
