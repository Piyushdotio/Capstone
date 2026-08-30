import express from "express"
import morgan from "morgan"
import agentRouter from "./router/agent.routes.js"
const app=express()

//middleware

app.use(express.json())
app.use(morgan("dev"))


app.get("/api/status/healthz", (req, res)=>{
    res.status(200).json({
        status:"ok"
    })
})
app.use("/api/ai", agentRouter)

export default app