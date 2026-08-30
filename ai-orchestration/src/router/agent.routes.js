import { Router } from "express";
import agent from "../agent/code.agent.js";
import { custom } from "zod";

const agentRouter = Router()
//ai invoke have two paramter first is messages and second is config 
// config can be used to pass additional information to the agent which can be later used by the tools
agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message,projectId } = req.body
        //for streaming
        const response = await agent.stream(
            { messages: [{
            role:"user",
            content:message
        }] },{
            configurable:{
                projectId
            },
            streamMode:"custom"
        })
        //for streaming use for await loop
        for await (const chunk of response){
            console.log(chunk);
            
        }
        res.json({ response })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
})

export default agentRouter
