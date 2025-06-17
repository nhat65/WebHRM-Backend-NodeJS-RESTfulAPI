import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import userRouter from './routers/userRouter';
import accountRouter from './routers/accountRouter';
import entitlementRouter from './routers/entitlementRouter'
import leaveRouter from './routers/leaveRouter'

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/account', accountRouter);
app.use('/api/entitlement', entitlementRouter);
app.use('/api/leave', leaveRouter);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'hello' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}...`);
});