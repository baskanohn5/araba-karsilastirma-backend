const validateCarMiddleware = (req, res, next) => {
  const {
    brand,
    model,
    year,
    engine,
    fuelType,
    transmission
  } = req.body;

  if (!brand) {
    return res.status(400).json({
      success: false,
      message: "brand alanı zorunludur"
    });
  }

  if (!model) {
    return res.status(400).json({
      success: false,
      message: "model alanı zorunludur"
    });
  }

  if (!year) {
    return res.status(400).json({
      success: false,
      message: "year alanı zorunludur"
    });
  }

  if (!engine) {
    return res.status(400).json({
      success: false,
      message: "engine alanı zorunludur"
    });
  }

  if (!fuelType) {
    return res.status(400).json({
      success: false,
      message: "fuelType alanı zorunludur"
    });
  }

  if (!transmission) {
    return res.status(400).json({
      success: false,
      message: "transmission alanı zorunludur"
    });
  }

  next();
};

module.exports = validateCarMiddleware;