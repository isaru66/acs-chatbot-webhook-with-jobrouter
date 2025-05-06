const JobRouterClient = require('@azure-rest/communication-job-router').default;

const main = async () => {
  console.log("Azure Communication Services - Job Router Quickstart")

  const connectionString = process.env["ACS_CONNECTION_STRING"];
  const client = JobRouterClient(connectionString);
  
  const distributionPolicy = await client.path("/routing/distributionPolicies/{distributionPolicyId}", "distribution-policy-1").patch({
    body: {    
      name: "distribution-policy-1",
      offerExpiresAfterSeconds: 180,
      mode: {
        kind: "longestIdle",
        minConcurrentOffers: 1,
        maxConcurrentOffers: 3,
      },
    },
    contentType: "application/merge-patch+json"
  });

  console.log(`==Created distribution policy==`);
  console.log(JSON.stringify(distributionPolicy.body));
  console.log(`====`);

  const queue = await client.path("/routing/queues/{queueId}", "queue-chat-human-agent").patch({
    body: {
      name: "queue-chat-human-agent",
      distributionPolicyId: distributionPolicy.body.id
    },
    contentType: "application/merge-patch+json"
  });
  console.log(`==Created queue==`);
  console.log(JSON.stringify(queue.body));
  console.log(`====`);
};

main().catch((error) => {
  console.log("Encountered an error:\n");
  console.log(error);
})
