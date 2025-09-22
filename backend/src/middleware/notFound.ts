import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../types';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
  };
  
  res.status(404).json(response);
};