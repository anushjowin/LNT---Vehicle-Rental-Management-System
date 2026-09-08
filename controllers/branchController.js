const Branch = require("../models/Branch");

exports.createBranch = async (req, res, next) => {
  try {
    const { name, city, address, phone } = req.body;

    const branch = await Branch.create({ name, city, address, phone });

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBranchById = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
