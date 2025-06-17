import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { signinSchema } from '../middlewares/validator';
import { doHashValidation } from '../utils/hashing';
import transport from '../middlewares/sendMail';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

interface Account extends RowDataPacket {
  username: string,
  password: string,
  role: string,
  status: string,
  employee_id: string
}

export const signin = async (req: Request, res: Response): Promise<void> => {
  const { username, password }: { username: string; password: string } = req.body;

  try {
    const { error } = signinSchema.validate({ username, password });
    if (error) {
      res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
      return;
    }

    const [existingAccount] = await pool.query<Account[]>(`SELECT * FROM account 
      WHERE username = ?`, [username]);
    if (!existingAccount) {
      res.status(401).json({
        success: false,
        message: 'Username does not exist!',
      });
      return;
    }

    const result = await doHashValidation(password, existingAccount[0].password);
    if (!result) {
      res.status(401).json({
        success: false,
        message: 'Wrong password!',
      });
      return;
    }

    const token = jwt.sign(
      {
        employeeId: existingAccount[0].employee_id,
        status: existingAccount[0].status,
        role: existingAccount[0].role,
      },
      process.env.TOKEN_SECRET as string,
      { expiresIn: '8h' }
    );

    res
      .cookie('Authorization', 'Bearer ' + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        success: true,
        token,
        message: 'Login successfully!',
      });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const signout = async (_req: Request, res: Response): Promise<void> => {
  res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'Logout successfully!' });
};
