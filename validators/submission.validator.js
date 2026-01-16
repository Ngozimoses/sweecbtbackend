const Joi = require('joi');
const createSubmissionSchema = Joi.object({
  exam: Joi.string().required(),
  student: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      question: Joi.string().required(),
      answer: Joi.string().required()
    })
  ).min(1).required()
});

module.exports = {
  createSubmissionSchema
};