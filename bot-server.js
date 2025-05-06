import { ChatClient } from '@azure/communication-chat';
import JobRouterClient from '@azure-rest/communication-job-router';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { AzureOpenAI } from "openai";
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import customer_info from './mock-data/customer-info.js';
import service_info from './mock-data/service-policy.js';

import dotenv from "dotenv";
dotenv.config();

const app = express()
const port = 8081

// Add this new line to create the thread list
const threadsWithHumanAgent = new Set();

// Setup Azure Communication service
let endpointUrl = process.env.ACS_ENDPOINT || 'https://acs-default1.asiapacific.communication.azure.com/';
let botIdentity = process.env.ACS_BOT_IDENTITY;
let userAccessToken = process.env.ACS_BOT_TOKEN;
let chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userAccessToken));
let jobRouterClient = JobRouterClient(process.env.ACS_CONNECTION_STRING);

// Setup Azure OpenAI
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini";
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini";
const apiVersion = "2024-04-01-preview";
const options = { endpoint, apiKey, deployment, apiVersion }
const aoaiClient = new AzureOpenAI(options);

let intents = {
  "wants_disconnect": [
    "I want to disconnect",
    "Please end this chat",
    "Close this conversation",
    "End chat",
    "Bye",
    "Goodbye"
  ],
  "confirms_disconnect": [
    "Yes, please disconnect",
    "Yes, end the chat",
    "Yes, close the conversation",
    "Yes, goodbye",
    "Confirm disconnect"
  ],
  "needs_agent": [
    "I need to speak with a human",
    "Connect me to an agent",
    "Talk to customer service",
    "Speak with representative",
    "Talk to human"
  ],
}

// Setup Express server
app.use(express.urlencoded());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/webhook', async (req, res) => {
  if (!req.body || !req.body.length) {
    return res.status(400).send('Invalid request body');
  }

  // Log the request body for debugging 
  console.log('Received Event Grid event:', JSON.stringify(req.body));

  const event = req.body[0];
  const eventType = event.eventType;

  // Handle Event Grid validation request
  if (eventType === "Microsoft.EventGrid.SubscriptionValidationEvent") {
    console.log("Got validation request from Event Grid");
    const validationCode = event.data.validationCode;
    console.log("Validation Event - Code:", validationCode);
    return res.status(200).json({
      validationResponse: validationCode
    });
  }

  // Handle ChatMessageReceivedInThread events
  // - Microsoft.Communication.ChatMessageReceivedInThread, will send only once <- [USE THIS ONE]
  // - Microsoft.Communication.ChatMessageReceived, will send to all participants in the thread
  if (eventType === "Microsoft.Communication.ChatMessageReceivedInThread") {
    try {
      const messageData = event.data;
      let { messageId, senderDisplayName, messageBody, threadId } = messageData;
      let senderId = messageData.senderCommunicationIdentifier.rawId;

      if (threadsWithHumanAgent.has(threadId)) {
        console.log(`Thread ${threadId} has human agent, ignoring bot processing`);
        return res.status(200).send();
      }

      // Check if the message is not from the bot itself
      if (senderId != botIdentity) {
        const intent = await classifyIntent(messageBody);
        if (intent === "needs_agent") {
          // Create ACS Job Router to find human agent
          console.log("Intent classified as 'needs_agent', creating ACS Job Router job...");
          const jobId = uuidv4();
          const job = await jobRouterClient.path("/routing/jobs/{jobId}", jobId).patch({
            body: {
              channelId: "chat",
              channelReference: `${threadId}`,
              queueId: "queue-chat-human-agent",
              priority: 1,
              requestedWorkerSelectors: [],
            },
            contentType: "application/merge-patch+json"
          });
          console.log("ACS Job Router job created");
        }
        else {
          let chatThreadClient = chatClient.getChatThreadClient(threadId);
          // Add bot to the chat thread
          const addParticipantsRequest = {
            participants: [
              {
                id: { communicationUserId: botIdentity },
                displayName: '[BOT] General Bot',
              }
            ]
          };
          await chatThreadClient.addParticipants(addParticipantsRequest);

          let aiResponse = await generateAIResponse(messageBody, threadId);
          // send message to the chat thread
          const sendMessageRequest = {
            content: aiResponse,
          };
          await chatThreadClient.sendMessage(sendMessageRequest);

        }
      }
      return res.status(200).send();
    } catch (error) {
      console.error('Error handling chat message:', error);
      return res.status(500).send();
    }
  }
  // Handle Microsoft.Communication.RouterWorkerOfferAccepted events
  if (eventType === "Microsoft.Communication.RouterWorkerOfferAccepted") {
    try {
      // Extract workerId and channelReference
      const workerId = event.data.workerId;
      const threadId = event.data.channelReference;

      // Add this line to track threads with human agents
      threadsWithHumanAgent.add(threadId);
      console.log(`Added thread ${threadId} to human agent list`);

      // Create ACS formatted worker ID
      const workerACSId = `8:acs:${workerId}`;

      // Get chat thread client
      const chatThreadClient = chatClient.getChatThreadClient(threadId);

      // Add worker to the chat thread
      await chatThreadClient.addParticipants({
        participants: [
          {
            id: { communicationUserId: workerACSId },
          }
        ]
      });

      console.log(`Successfully added worker ${workerACSId} to thread ${threadId}`);
      return res.status(200).send();

    } catch (error) {
      console.error('Error handling worker offer accepted:', error);
      return res.status(500).send();
    }
  }

  // Handle other Event Grid events
  console.log('Received unknown Event Grid event:', event);
  return res.status(200).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function classifyIntent(messageBody) {
  const prompt = `Given the following message and conversation context, classify the message into one of these intents: ${Object.keys(intents).join(",")}

Example messages for each intent:
${JSON.stringify(intents, null, 2)}

Message to classify:
${messageBody}

Return ONLY the intent name, nothing else. If no intent matches, return "general_query"
`;
  const response = await aoaiClient.chat.completions.create({
    messages: [
      { role: "system", content: prompt },
    ],
    max_tokens: 4096,
    temperature: 1,
    top_p: 1,
    model: modelName
  });
  if (response?.error !== undefined && response.status !== "200") {
    throw response.error;
  }
  const intentOutput = response.choices[0].message.content;
  console.log("Intent classification result: " + intentOutput);
  return response.choices[0].message.content;
}

async function generateAIResponse(messageBody, threadId) {
  const prompt = `You are a contact center agent for Contoso Bank, assisting customers with inquiries related to financial product/services. Your goal is to resolve customer issues efficiently, provide clear and empathetic communication, and ensure customer satisfaction.

Below are customer information and context:
${JSON.stringify(customer_info, null, 2)}

Below are Contoso Bank policies and avaliable services:
${JSON.stringify(service_info, null, 2)}

Answer the question as best as you can in a concise way. If you are not sure about the answer, ask for more information or clarify the question. If you cannot help, suggest escalation to a human agent.

Do not use **markdown** or any other formatting in your response.
`;

  let messageHistory = await getAOAIMessageHistoryFromACSThread(threadId, 10, botIdentity);
  messageHistory.unshift({ role: "system", content: prompt });
  messageHistory.push({ role: "user", content: messageBody });

  const response = await aoaiClient.chat.completions.create({
    messages: messageHistory,
    max_tokens: 4096,
    temperature: 1,
    top_p: 1,
    model: modelName
  });
  if (response?.error !== undefined && response.status !== "200") {
    throw response.error;
  }
  const intentOutput = response.choices[0].message.content;
  console.log("Intent classification result: " + intentOutput);
  return response.choices[0].message.content;
}

async function getAOAIMessageHistoryFromACSThread(threadId, messageSize, botUserId) {
  try {
    let message = await listMessagesFromThread(threadId, messageSize);
    /*
    { role: "system", content: "You are a helpful assistant. Provide concise and accurate responses to user queries." },
    { role: "user", content: "I am going to Paris, what should I see?" },
    { role: "assistant", content: "Paris is a beautiful city! You should visit the Eiffel Tower" }
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