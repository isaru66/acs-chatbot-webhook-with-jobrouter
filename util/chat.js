import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import dotenv from "dotenv";
dotenv.config();

// Your unique Azure Communication service endpoint
let endpointUrl = process.env.ACS_ENDPOINT || 'https://acs-default1.asiapacific.communication.azure.com/';
let botIdentity = process.env.ACS_BOT_IDENTITY;
let userAccessToken = process.env.ACS_BOT_TOKEN;

let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));
console.log('Azure Communication Chat client created!');

// Create new chat thread
const createChatThreadRequest = {
    topic: "Hello, World!"
};
const createChatThreadOptions = {
    participants: [
        {
            id: { communicationUserId: '8:acs:973091a8-f96e-4036-a11e-5cd16965d223_00000027-25b5-51be-eed1-1cbd45604eba' },
            displayName: '[BOT] General Bot',
        }
    ]
};

/*
const createChatThreadResult = await chatClient.createChatThread(
    createChatThreadRequest,
    createChatThreadOptions
);
let threadId = createChatThreadResult.chatThread.id;
*/

// Get Thread Id
let threadId = '19:acsV1_v7PaxD33R4fXhYgeot1jEEBMkb9MegR5EPQ_PxIKxOM1@thread.v2';
let chatThreadClient = chatClient.getChatThreadClient(threadId);
console.log(`Chat Thread client for threadId:${threadId}`);

// Add a user to the chat thread
const addParticipantsRequest = {
    participants: [
        {
            id: { communicationUserId: '8:acs:973091a8-f96e-4036-a11e-5cd16965d223_00000027-25b5-51be-eed1-1cbd45604eba' },
            displayName: '[BOT] General Bot',
        }
    ]
};
await chatThreadClient.addParticipants(addParticipantsRequest);
console.log('Participant added to the chat thread!');

await chatThreadClient.sendTypingNotification();
console.log('Typing indicator sent');

// Simulate some typing time
await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds

// Send a message to the chat thread
const sendMessageRequest =
{
    content: `เวลาทำการของธนาคารทั่วไป
วันจันทร์ - ศุกร์: เปิด 08:30 - 15:30 น.

ธนาคารในห้างสรรพสินค้า
วันจันทร์ - อาทิตย์: เปิดตามเวลาห้างสรรพสินค้า เช่น 10:00 - 18:30 น.`,
};
/*
let sendMessageOptions =
{
    senderDisplayName: '[BOT] General Bot',
    type: 'text',
};*/
const sendChatMessageResult = await chatThreadClient.sendMessage(sendMessageRequest);
const messageId = sendChatMessageResult.id;
console.log(`Message sent!, message id:${messageId}`);