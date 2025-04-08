import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";

import dotenv from "dotenv";

dotenv.config();

// init arcjet

export const aj = arcjet ({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        // shield protects your app from common attacks e.g. SQL injection, XSS, CSRF attacks
        shield({ mode: "LIVE" }),
        // bot detection
        detectBot({ 
            mode: "LIVE",
            allow: ["CATEGORY:SEARCH_ENGINE"],
         }),
        // rate limiting
        tokenBucket({
            mode: "LIVE",
            refillRate: 5, // new tokens after 10 seconds
            interval: 10, // seconds
            capacity: 10, // tokens
        }),
    ]
})