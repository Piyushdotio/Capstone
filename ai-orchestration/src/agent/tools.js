import axios from "axios"
import { tool } from "@langchain/core/tools"
import { z } from "zod"

export const listFiles = tool(
    async () => {
        console.log("======================")
        console.log("using list file tool")
        console.log("======================")
        const response = await axios.get("http://01a02e81-0b3b-7271-b5ad-7d26e701b8ee.agent.localhost/list-files")
        console.log("======================")
        console.log("response from list file tool: ", response.data)
        console.log("======================")

        return JSON.stringify(response.data.files)
    }, {
        name: "list_files",
        description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
        schema: z.object({})
    }


    //zod is use for = = tool kaise input mangega means schema kaisa banega
    
)

export const readFiles = tool(
    async ({ files = [] }) => {
        console.log("======================")
        console.log("using read file tool with files: ", files)
        console.log("======================")
        const response = await axios.get("http://01a02e81-0b3b-7271-b5ad-7d26e701b8ee.agent.localhost/read-files?files=" + files.join(","))
        console.log("======================")
        console.log("response from read file tool", response.data)
        console.log("======================")
        return JSON.stringify(response.data)
    }, {
        name: "read_files",
        description: "Read the content of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        schema: z.object({
            files: z.array(z.string()).describe("The list of files absolute path to read. These should be files that were listed using the list_files tool or created later")
        })
    }
)

export const updateFiles = tool(
    async ({ files }) => {
        console.log("======================")
        console.log("using update file tool", files)
        console.log("======================")
        const response = await axios.patch("http://01a02e81-0b3b-7271-b5ad-7d26e701b8ee.agent.localhost/update-files", {
            updates: files
        })
        console.log("======================")
        console.log("response from update file tool", response.data)
        console.log("======================")
        return JSON.stringify(response.data.results)
    },
    {
        name: "update_files",
        description: "update the content of specified files. This is useful for making changes to file based on the requirements to the task at hand. This tool can also be used to create new files by providing the file name in the file field and the content to be added in the content field.",
        schema: z.object({
            files: z.array(z.object({
                path: z.string().describe("The absolute path to the file to update."),
                content: z.string().describe("The new content for the file.")
            })).describe("The list of files to update and their new contents")
        })
    }
)
