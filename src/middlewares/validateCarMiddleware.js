const Joi = require("joi");

const carSchema = Joi.object({
  brand: Joi.string().required(),

  model: Joi.string().required(),

  year: Joi.number().integer().min(1990).max(2035).required(),

  engine: Joi.string().required(),

  fuelType: Joi.string()
    .valid("Benzin", "Dizel", "LPG", "Hybrid", "Elektrik")
    .required(),

  transmission: Joi.string()
    .valid("Manuel", "Otomatik")
    .required(),

  bodyType: Joi.string()
    .valid("Sedan", "Hatchback", "SUV", "Coupe", "Pickup")
    .required(),

  minPrice: Joi.number().min(0).required(),

  maxPrice: Joi.number().min(Joi.ref("minPrice")).required(),

  averageFuel: Joi.number().min(0).max(30).required(),

  marketPopularity: Joi.number().min(1).max(10).required(),

  sparePartAvailability: Joi.number().min(1).max(10).required(),

  maintenanceCost: Joi.number().min(1).max(10).required(),

  secondHandValue: Joi.number().min(1).max(10).required(),

  chronicProblemScore: Joi.number().min(1).max(10).required()
});

const validateCarMiddleware = (req, res, next) => {
  const { error } = carSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

module.exports = validateCarMiddleware;