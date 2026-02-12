const express = require("express");
const router = express.Router();
const HealthData = require("../models/HealthData");
const protect = require("../middleware/authMiddleware");

// Add health data (logged-in user only)
router.post("/add", protect, async (req, res) => {
  try {
    const { weight, height, steps } = req.body;

    // BMI calculation
    const heightInMeter = height / 100;
    const bmi = (weight / (heightInMeter * heightInMeter)).toFixed(2);

    let bmiCategory = "";

    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 24.9) bmiCategory = "Normal";
    else if (bmi < 29.9) bmiCategory = "Overweight";
    else bmiCategory = "Obese";

    const health = await HealthData.create({
      user: req.user.id,
      weight,
      height,
      steps,
      bmi,
      bmiCategory,
    });

    res.status(201).json(health);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my health data
router.get("/mydata", protect, async (req, res) => {
  try {
    const data = await HealthData.find({ user: req.user.id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

router.get("/ai-advice", protect, async (req, res) => {
  try {
    const latest = await HealthData.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });

    if (!latest) {
      return res.json({ message: "No health data found." });
    }

    let advice = "";

    if (latest.bmiCategory === "Underweight") {
      advice = "Increase calorie intake and strength training.";
    } 
    else if (latest.bmiCategory === "Normal") {
      advice = "Maintain balanced diet and regular exercise.";
    } 
    else if (latest.bmiCategory === "Overweight") {
      advice = "Increase cardio and reduce sugar intake.";
    } 
    else {
      advice = "Consult doctor and start structured workout plan.";
    }

    res.json({
      bmi: latest.bmi,
      category: latest.bmiCategory,
      advice,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
