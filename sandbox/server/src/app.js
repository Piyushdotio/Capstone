import express from "express";
import morgan from "morgan";
import {createPod} from "./kubernetes/pod.js";
import {createService} from "./kubernetes/service.js";
import {v7 as uuid} from "uuid";
const app = express();


// Middleware to log requests
app.use(morgan("dev"));

// Middleware to parse JSON
app.use(express.json());

app.use(express.urlencoded({extended:true}))

app.get("/api/sandbox/health", (req,res) => {
    res.status(200).json(
        {message: "sandbox is running...",
         status:"ok"
        }
    );
})
app.post("/api/sandbox/start",async(req,res)=>{
    const sandboxId=uuid();
    try{
        await Promise.all([
            createPod(sandboxId),
            createService(sandboxId),
            
        ])
        return res.status(201).json(
            {message:"sandbox started successfully",
             sandboxId,
             previewUrl:`http://${sandboxId}.preview.localhost`
            }
        )
    }
    catch (err) {
    console.error("FULL ERROR:", err);
    console.error("STACK:", err.stack);

    return res.status(500).json({
        error: err.message
    });
}
})
export default app