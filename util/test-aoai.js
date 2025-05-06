import { AzureOpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini";
const apiVersion = "2024-04-01-preview";

export async function main() {
    const options = { endpoint, apiKey, deployment, apiVersion }
    const client = new AzureOpenAI(options);

    const response = await client.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "I am going to Paris, what should I see?" }
        ],
        max_tokens: 4096,
        temperature: 1,
        top_p: 1,
        model: modelName
    });

    if (response?.error !== undefined && response.status !== "200") {
        throw response.error;
    }
    console.log(response.choices[0].message.content);
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});