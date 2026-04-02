import express from "express";
import { DeliveryOptions } from "../models/DeliveryOptions.js";

const router = express.Router()

router.get('/', async (requestAnimationFrame, res) => {
    const deliveryOptions = await DeliveryOptions.findAll();
    res.json(deliveryOptions);
});

export default router;