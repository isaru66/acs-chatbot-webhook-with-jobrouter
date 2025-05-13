import JobRouterClient from "@azure-rest/communication-job-router";
import dotenv from "dotenv";

dotenv.config();

const main = async () => {
  console.log("Starting cleanup of Job Router workers...");
  const connectionString = process.env["ACS_CONNECTION_STRING"];
  //console.log("Connection string:", connectionString);
  const client = JobRouterClient(connectionString);

  try {
    // List all workers
    const workersResponse = await client.path("/routing/workers").get();
    if (workersResponse.status != "200") {
      console.error("Failed to fetch workers:", workersResponse.body);
      return;
    }

    const workers = workersResponse.body.value || [];
    console.log(`Found ${workers.length} workers.`);

    // Delete each worker
    for (const worker of workers) {
      let deleteResponse = await client
        .path(`/routing/workers/${worker.id}`)
        .delete();
      if (deleteResponse.status === "204") {
        console.log(`Deleted worker with ID: ${worker.id}`);
      } else {
        console.error(
          `Failed to delete worker with ID: ${worker.id}`,
          JSON.stringify(deleteResponse.body)
        );

        if (
          deleteResponse.body.communicationError.details[0].code ===
          "WorkerHasAssignments"
        ) {
          await cleanupWorkerAssignment(worker, client);
          // Retry deleting the worker after cleanup
          deleteResponse = await client
            .path(`/routing/workers/${worker.id}`)
            .delete();
        }
      }
      // Simulate some delay to avoid hitting rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

main().catch((err) => {
  console.error("Unhandled error:", err);
});

async function cleanupWorkerAssignment(worker, client) {
  console.log(
    `Worker ${worker.id} has active assignments. Fetching assignedJob...`
  );
  const workerOffer = await client
    .path("/routing/workers/{workerId}", worker.id)
    .get();
  for (const job of workerOffer.body.assignedJobs) {
    console.log(
      `Worker ${workerOffer.body.id} have active job on ${job.jobId}`
    );

    console.log(
      `Deleteing job for worker ${workerOffer.body.id} on job ${job.jobId}`
    );

    await client
      .path(
        "/routing/jobs/{jobId}/assignments/{assignmentId}:complete",
        job.jobId,
        job.assignmentId
      )
      .post();
    console.log(`Worker ${workerOffer.body.id} has completed job ${job.jobId}`);

    await client
      .path(
        "/routing/jobs/{jobId}/assignments/{assignmentId}:close",
        job.jobId,
        job.assignmentId
      )
      .post({
        body: { dispositionCode: "Resolved" },
      });
    console.log(`Worker ${workerOffer.body.id} has close job ${job.jobId}`);
  }
}
