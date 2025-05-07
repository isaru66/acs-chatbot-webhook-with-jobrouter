import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import dotenv from "dotenv";
dotenv.config();

// Your unique Azure Communication service endpoint
let endpointUrl = process.env.ACS_ENDPOINT;
let botIdentity = process.env.ACS_BOT_IDENTITY;
let userAccessToken = process.env.ACS_BOT_TOKEN;



async function getAOAIMessageHistoryFromACSThread(threadId, messageSize, botUserId) {
  try {
    let message = await listMessagesFromThread(threadId, messageSize);
    /*
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "I am going to Paris, what should I see?" }
     */
    let result = message.map((msg) => {
      return {
        role: msg.acsUserId === botUserId ? "assistant" : "user",
        content: msg.message
      };
    });
    return result;
  } catch (error) {
    console.error("Error getAOAIMessageContext:", error);
    throw error;
  }
}

async function listMessagesFromThread(threadId, messageSize = 10, maxPageSize = 20) {
  try {
    const chatThreadClient = chatClient.getChatThreadClient(threadId);
    const options = { maxPageSize };

    // Fetch messages from the chat thread
    let rawMessages = chatThreadClient.listMessages(options).byPage();
    let messages = [];

    for await (const messagesInPagination of rawMessages) {
      for (const msg of messagesInPagination) {
        {
          if (msg.type === 'text') {
            let acsUserId = msg.sender?.communicationUserId;
            let message = msg.content.message;
            messages.push({
              acsUserId,
              message
            });
          }
        }
        if (messages.length >= messageSize) {
          break;
        }
      }
    }
    // ACS return last message first, so we need to reverse the order
    return messages.reverse();
  } catch (error) {
    console.error("Error listing messages from chat thread:", error);
    throw error;
  }
}


let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));
console.log('Azure Communication Chat client created!');

// Get Thread Id
let threadId = '19:acsV1_v7PaxD33R4fXhYgeot1jEEBMkb9MegR5EPQ_PxIKxOM1@thread.v2';
let chatThreadClient = chatClient.getChatThreadClient(threadId);
console.log(`Chat Thread client for threadId:${threadId}`);



const sendChatMessageResult = await getAOAIMessageHistoryFromACSThread(threadId,7, botIdentity);
console.log('Last five messages in the chat thread:', sendChatMessageResult);
