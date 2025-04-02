"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const artist_controller_1 = require("../controllers/artist.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(artist_controller_1.getArtists)
    .post(auth_1.protect, artist_controller_1.createArtist);
router.route('/:id')
    .get(artist_controller_1.getArtist)
    .put(auth_1.protect, artist_controller_1.updateArtist)
    .delete(auth_1.protect, artist_controller_1.deleteArtist);
router.route('/:id/reviews')
    .post(auth_1.protect, artist_controller_1.addArtistReview);
exports.default = router;
