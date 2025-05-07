import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import dotenv from "dotenv";
dotenv.config();

// Your unique Azure Communication service endpoint
let endpointUrl = process.env.ACS_ENDPOINT;
let botIdentity = process.env.ACS_BOT_IDENTITY;
let userAccessToken = process.env.ACS_BOT_TOKEN;

let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));

async function cleanupChatThreads() {
    try {
        console.log("Fetching chat threads...");
        const chatThreads = chatClient.listChatThreads();
        for await (const thread of chatThreads) {
            console.log(`Deleting chat thread with ID: ${thread.id}`);
            await chatClient.deleteChatThread(thread.id);
            // Simulate some delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log("All chat threads in this page have been deleted\nhowever, there may be more pages of threads to delete.\nPlease run the script again to delete all threads.");
    } catch (error) {
        console.error("Error during cleanup:", error);
    }
}

// Call the cleanup function
cleanupChatThreads();