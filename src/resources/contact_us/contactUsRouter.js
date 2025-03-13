const express = require("express");
const {
  create,
  update,
  getAll,
  getOne,
  deleteContact,
} = require("./contactUsController");
const { validateRequest } = require("../../utils/validateRequest");
const contactUsValidator = require("./contactUsValidator");
const {
  authUser,
  authAdmin,
} = require("../../middleware/authentication.middleware");
const contactUsRouter = express.Router();

contactUsRouter.post(
  "/",
  authUser,
  validateRequest(contactUsValidator.create),
  create
);
contactUsRouter.get("/", authAdmin, getAll);
contactUsRouter.get("/:id", authAdmin, getOne);
contactUsRouter.patch(
  "/:id",
  authAdmin,
  validateRequest(contactUsValidator.update),
  update
);
contactUsRouter.delete("/:id", authAdmin, deleteContact);
module.exports = contactUsRouter;
