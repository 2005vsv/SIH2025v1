const express = require("express");
const { Schema, ValidationResult } = require('joi');

const validateRequest = (schema) => {
  return (req, res, next)=> {
    const { error }= schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
      return;
    }

    next();
  };
};


const validateQuery = (schema) => {
  return (req, res, next)=> {
    const { error }= schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success,
        message: 'Query validation failed',
        errors,
      });
      return;
    }
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next)=> {
    const { error }= schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success,
        message: 'Parameter validation failed',
        errors,
      });
      return;
    }
    next();
  };
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams
};
