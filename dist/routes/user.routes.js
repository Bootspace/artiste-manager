"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', user_controller_1.registerUser);
router.post('/login', user_controller_1.loginUser);
router.get('/me', auth_1.protect, user_controller_1.getCurrentUser);
router.put('/me', auth_1.protect, user_controller_1.updateUserProfile);
exports.default = router;
