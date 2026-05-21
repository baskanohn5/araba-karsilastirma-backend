const Joi = require("joi");

const carSchema = Joi.object({
  brand: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  model: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required(),

  year: Joi.number()
    .integer()
    .min(1990)
    .max(2035)
    .required(),

  engine: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required(),

  fuelType: Joi.string()
    .valid(
      "Benzin",
      "Dizel",
      "LPG",
      "Hybrid",
      "Elektrik"
    )
    .required(),

  transmission: Joi.string()
    .valid(
      "Manuel",
      "Otomatik"
    )
    .required(),

  bodyType: Joi.string()
    .valid(
      "Sedan",
      "Hatchback",
      "SUV",
      "Coupe",
      "Pickup"
    )
    .required(),

  minPrice: Joi.number()
    .min(0)
    .max(100000000)
    .required(),

  maxPrice: Joi.number()
    .min(Joi.ref("minPrice"))
    .max(100000000)
    .required(),

  averageFuel: Joi.number()
    .min(0)
    .max(30)
    .required(),

  marketPopularity: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),

  sparePartAvailability: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),

  maintenanceCost: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),

  secondHandValue: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),

  chronicProblemScore: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),

  safetyScore: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional(),

  comfortScore: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional(),

  performanceScore: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional(),

  imageUrl: Joi.string()
    .uri()
    .optional(),

  description: Joi.string()
    .max(3000)
    .optional(),
})
.options({
  abortEarly: true,
  allowUnknown: false,
});

const validateCarMiddleware = (
  req,
  res,
  next
) => {
  const { error, value } =
    carSchema.validate(req.body);

  if (error) {
    console.error(
      "CAR VALIDATION ERROR:",
      error.details[0].message
    );

    return res.status(400).json({
      success: false,
      message: "Geçersiz araç verisi",
      detail: error.details[0].message,
    });
  }

  req.body = value;

  next();
};

module.exports = validateCarMiddleware;