import express from "express"
import morgan from "morgan"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

const WORKING_DIR = '/workspace'

const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.status(200).json({
        message: "sandbox agent is running",
        status: "success"
    })
})

app.get("/debug", (req, res) => {
    try {
        const workspaceContent = execSync("ls -la /workspace").toString();
        const rootContent = execSync("ls -la /").toString();
        res.status(200).json({
            workspaceContent,
            rootContent,
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stderr: error.stderr ? error.stderr.toString() : ""
        });
    }
})
app.get("/list-files", async (req, res) => {
    try {
        const allFiles = await fs.promises.readdir(WORKING_DIR, {
            recursive: true,
        });
        // Filter out node_modules and hidden files/directories (starting with .)
        const files = allFiles.filter(file => {
            const parts = file.split(/[/\\]/);
            return !parts.includes('node_modules') && !parts.some(part => part.startsWith('.'));
        });
        res.status(200).json({
            message: "Elements in working Directory",
            files,
        })
    } catch (error) {
        res.status(500).json({
            message: "Error listing files",
            error: error.message || error,
        })
    }
})
/**
 * @routes Get /read-files
 * @description Reads the content of files requested in the query parameter 'files' and returns their content as json object.
 * -eg: /read-files?files=file1.txt,/src/file2.txt
 */
app.get("/read-files", async (req, res) => {
    const files = req.query.files
    if (!files) {
        return res.status(400).json({
            message: "No files specified in query paramter",
            status: "error",
        })
    }
    const fileList = files.split(",")

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = path.join(WORKING_DIR, file)
        try {
            const content = await fs.promises.readFile(filePath, "utf-8")
            return {
                [filePath]: content,
            }
        } catch (error) {
            return {
                [filePath]: `Error reading file : ${error}`,
            }
        }
    }))
    return res.status(200).json({
        message: "Files content",
        results,
    })



})

/**
 * @routes Patch /update-files
 * @description Updates the files. Accepts a JSON Array of file-to-be-updated objects.
 * eg: /update-files
 * [
 * {
 * "path":"file1.txt",
 * "content":"new content",
 * },
 * {
 * "path":"src/file2.txt",
 * "content":"new content",
 * } 
 * ]
 */
app.patch("/update-files", async (req, res) => {
    let updates = req.body;
    if (updates && !Array.isArray(updates) && Array.isArray(updates.updates)) {
        updates = updates.updates;
    }
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: "Updates must be a JSON Array",
            status: "error",
        })
    }
    const results = await Promise.all(updates.map(async (item) => {
        try {
            const update = item.update || item;
            const file = update.file || update.path;
            const content = update.content;
            if (typeof file !== 'string') {
                throw new Error("File path must be a string");
            }
            const filePath = path.join(WORKING_DIR, file)
            await fs.promises.writeFile(filePath, content || "", "utf-8")
            return {
                [filePath]: "updated",
            }
        } catch (error) {
            return {
                error: `Error updating file: ${error.message || error}`,
            }
        }
    }))
    return res.status(200).json({
        message: "Files updated successfully",
        results,
    })
})

/**
 * @route post /create-files
 * @description Creates files in the working directory.
 * eg: /create-files
 * [
 * {
 * "path":"file1.txt",
 * "content":"new content",
 * },
 * {
 * "path":"src/file2.txt",
 * "content":"new content",
 * } 
 * ]
 */
app.post("/create-files", async (req, res) => {
    const files = req.body.files;
    if (!files || !Array.isArray(files)) {
        return res.status(400).json({
            message: "Invalid request body. files should be an Array of objects",
            status: "error",
        })
    }
    const results = await Promise.all(files.map(async (fileObj) => {
        const { file, content } = fileObj
        const filePath = path.join(WORKING_DIR, file)
        try {
            await fs.promises.mkdir(
                path.dirname(filePath),
                { recursive: true }
            );
            await fs.promises.writeFile(filePath, content, "utf-8")
            return {
                [filePath]: "file created successfully",
            }
        } catch (error) {
            return {
                [filePath]: `Error creating file : ${error}`,
            }
        }
    }))
    return res.status(200).json({
        message: "Files created successfully",
        results,
    })
})

app.use(morgan("dev"))
app.use(express.json())

export default app
