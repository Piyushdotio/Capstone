import { ChatMistralAI } from "@langchain/mistralai"
import "dotenv/config"
import { listFiles, readFiles, updateFiles } from "./tools.js"
import { createReactAgent } from "@langchain/langgraph/prebuilt"

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const agent = createReactAgent({
    llm: model,
    tools: [listFiles, readFiles, updateFiles]
})

await agent.invoke({
    messages: [
        {
            role: "user",
            content: "create a simple snake game using react and css"
        }
    ]
})
export default agent

