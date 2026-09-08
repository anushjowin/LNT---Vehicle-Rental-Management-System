const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");

router.get("/", getAllBranches);
router.get("/:id", getBranchById);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("name").trim().notEmpty().withMessage("Branch name is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
  ],
  validate,
  createBranch
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateBranch
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteBranch
);

module.exports = router;
