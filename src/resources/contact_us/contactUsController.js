// Controller file (contactController.js)
const asyncHandler = require("express-async-handler");
const contactService = require("./contactUsService");
const sendResponse = require("../../utils/sendResponse");
const responseStatusCodes = require("../../utils/responseStatusCode");
const notificationService = require("../notification/notificationService");
const sendPushNotification = require("../../utils/firebase_service");

const create = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;
  console.log("req.user", req.user);
  const contact = await contactService.addNew(req.body);
  await notificationService.addNew(
    "Contact Us Request Submitted!", // Updated title
    `Your request has been successfully submitted. Our team will get back to you shortly.`, // Updated message
    "contactus", // Changed to reflect the context
    req.user.id,
    contact?._id
  );
  if (req.user.fcmToken) {
    await sendPushNotification(
      req.user.fcmToken,
      "Contact Us Request Submitted!", // Updated title
      `Your request has been successfully submitted. Our team will get back to you shortly.`, // Updated message
      {
        id: contact?._id.toString(),
      }
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.CREATED,
    "Contact request created",
    true,
    contact,
    null
  );
});

const getAll = asyncHandler(async (req, res) => {
  const contacts = await contactService.getAll(
    req.query.user,
    req.query.page,
    req.query.limit
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Contacts retrieved",
    true,
    contacts,
    null
  );
});

const getOne = asyncHandler(async (req, res) => {
  const contact = await contactService.getOne(req.params.id);
  if (!contact) {
    return sendResponse(
      res,
      responseStatusCodes.NOTFOUND,
      "Contact not found",
      false,
      null,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Contact retrieved",
    true,
    contact,
    null
  );
});

const update = asyncHandler(async (req, res) => {
  const contact = await contactService.update(req.params.id, req.body);
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Contact updated",
    true,
    contact,
    null
  );
});

const deleteContact = asyncHandler(async (req, res) => {
  await contactService.delete(req.params.id);
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Contact deleted",
    true,
    null,
    null
  );
});

module.exports = { create, getAll, getOne, update, deleteContact };
