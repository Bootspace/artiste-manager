"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const event_controller_1 = require("../controllers/event.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(event_controller_1.getEvents)
    .post(auth_1.protect, event_controller_1.createEvent);
router.route('/:id')
    .get(event_controller_1.getEvent)
    .put(auth_1.protect, event_controller_1.updateEvent)
    .delete(auth_1.protect, event_controller_1.deleteEvent);
exports.default = router;
