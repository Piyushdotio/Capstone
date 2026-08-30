import axios from "axios"
import { tool } from "@langchain/core/tools"
import { z } from "zod"

export const listFiles = tool(
    async ({},config) => {
        const writer=config.writer
        writer("Listing files in project directory\n ")
        
        const response = await axios.get(`http://sandbox-service-${config.configurable.projectId}:3000/list-files`)
        writer("file listed successfully "+"files"+response.data.files.join(",")+"\n")
        
        return JSON.stringify(response.data.files)
    }, {
        name: "list_files",
        description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
        schema: z.object({})
    }


    //zod is use for = = tool kaise input mangega means schema kaisa banega
    
)

export const readFiles = tool(
    async ({ files = [] },config) => {
        const writer=config.writer
        writer("Reading files from project directory\n "+files.join(",")+"\n")
      
        const response = await axios.get(`http://sandbox-service-${config.configurable.projectId}:3000/read-files?files=${files.join(",")}`)
        writer("file read successfully\n ")
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
    async ({ files },config) => {
        const writer=config.writer
        writer("Updating files in project directory"+files.map(f=>f.file).join(",")+"\n")
        
        const response = await axios.patch(`http://sandbox-service-${config.configurable.projectId}:3000/update-files`, {
            updates: files
        })
         writer("file updated successfully\n ")
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
