import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors"
import dotenv from "dotenv";
import path from "path";

import productRoute from "./routes/productRoute.js";

import { sql } from "./config/db.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json()); //middleware to parse JSON bodies
app.use(cors()); //middleware to enable CORS
app.use(helmet(
    {contentSecurityPolicy:false},
)); //security middleware by setting various HTTP headers
app.use(morgan("dev")); //logging middleware

// apply arcjet middleware to all routes
app.use(async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested:1, // specifies that each request consumes one token
        })
        if (decision.isDenied()) {
            if(decision.reason.isRateLimit()){
                res.status(429).json({ error: "Too many requests" })
            } else if (decision.reason.isBot()) {
                res.status(403).json({ error: "Bot access denied" })
            } else {
                res.status(403).json({ error: "Forbidden" })
            }
            return
        }
        // check for spoofed bots
        if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
            res.status(403).json({error: "Spoofed bot detected"})
            return
        }
        next()
    }
    catch (error)
    {
        console.log("Arcjet error", error);
        next()
    }
})

app.use('/api/products', productRoute)

if(process.env.NODE_ENV==="production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")))
    app.get("*", (req,res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html" ))
    })
}

async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log("Database initialized successfully")
    } catch (error) {
        console.log("Error initDB", error);
    }
}

initDB().then(() => {
    app.listen(PORT, () => {
        console.log('Server is running on port ' + PORT);
      }
      )
})

