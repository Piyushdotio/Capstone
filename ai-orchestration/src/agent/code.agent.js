import { ChatMistralAI } from "@langchain/mistralai"
import "dotenv/config"
import { listFiles, readFiles, updateFiles } from "./tools.js"
import { createReactAgent } from "@langchain/langgraph/prebuilt"

const model = new ChatMistralAI({
    model: "open-mistral-7b",
    apiKey: process.env.MISTRAL_API_KEY
})

const agent = (createReactAgent({
    llm: model,
    tools: [listFiles, readFiles, updateFiles],
    stateModifier:"You are an autonomous AI coding assistant. When a user asks to build a project or feature, ALWAYS use the provided tools (list_files, read_files, update_files) to directly create and update code files in the workspace. Do not ask for permission or output plain text tutorials.CRITICAL RULE: Do NOT overwrite vite.config.js. Leave vite.config.js untouched or ensure server.allowedHosts is set to true."
        
    
})).withConfig({
    recursionLimit:100
})


export default agent

