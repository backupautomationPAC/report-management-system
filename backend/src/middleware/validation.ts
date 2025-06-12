import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(createError(message, 400));
    }
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(createError(message, 400));
    }
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('ADMIN', 'AE', 'SUPERVISOR', 'ACCOUNTING').optional(),
  }),

  // Report schemas
  createReport: Joi.object({
    clientName: Joi.string().min(2).max(100).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    title: Joi.string().max(200).optional(),
  }),

  updateReport: Joi.object({
    title: Joi.string().max(200).optional(),
    content: Joi.string().optional(),
  }),

  approveReport: Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    comments: Joi.string().max(1000).optional(),
  }),

  // User schemas
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('ADMIN', 'AE', 'SUPERVISOR', 'ACCOUNTING').required(),
  }),

  updateUser: Joi.object({
    email: Joi.string().email().optional(),
    name: Joi.string().min(2).max(100).optional(),
    role: Joi.string().valid('ADMIN', 'AE', 'SUPERVISOR', 'ACCOUNTING').optional(),
    isActive: Joi.boolean().optional(),
  }),

  // Query schemas
  reportsQuery: Joi.object({
    status: Joi.string().valid('DRAFT', 'PENDING_AE', 'PENDING_SUPERVISOR', 'PENDING_ACCOUNTING', 'APPROVED', 'REJECTED').optional(),
    clientName: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  harvestQuery: Joi.object({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().required(),
    client: Joi.string().optional(),
    project: Joi.string().optional(),
  }),
};
