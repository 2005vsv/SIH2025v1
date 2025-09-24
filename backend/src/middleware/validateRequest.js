const express = require("express");
const { Schema, ValidationResult } = require('joi');

const validateRequest = (schema) => {
  return (req, res, next)=> {
    const { error }= schema.validate(req.body, {
      abortEarly,
      allowUnknown,
      stripUnknown,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };
};


const validateQuery = (schema) => {
  return (req, res, next)=> {
    const { error }= schema.validate(req.query, {
      abortEarly,
      allowUnknown,
      stripUnknown,
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
      abortEarly,
      allowUnknown,
      stripUnknown,
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
