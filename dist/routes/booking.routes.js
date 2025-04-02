"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("../controllers/booking.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(auth_1.protect, booking_controller_1.getBookings)
    .post(auth_1.protect, booking_controller_1.createBooking);
router.route('/:id')
    .get(auth_1.protect, booking_controller_1.getBooking)
    .put(auth_1.protect, booking_controller_1.updateBooking)
    .delete(auth_1.protect, booking_controller_1.deleteBooking);
exports.default = router;
