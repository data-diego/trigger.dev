import { ResolvedConfig } from "@trigger.dev/core/v3/build";
import { DevCommandOptions } from "../commands/dev.js";
import { logger } from "../utilities/logger.js";
import {
  chalkError,
  chalkGrey,
  chalkLink,
  chalkRun,
  chalkSuccess,
  chalkTask,
  chalkWarning,
  chalkWorker,
  cliLink,
  prettyPrintDate,
} from "../utilities/cliOutput.js";
import { eventBus, EventBusEventArgs } from "../utilities/eventBus.js";
import { TaskRunError, TaskRunErrorCodes } from "@trigger.dev/core/v3/schemas";
import { formatDurationMilliseconds } from "@trigger.dev/core/v3";

export type DevOutputOptions = {
  name: string | undefined;
  dashboardUrl: string;
  config: ResolvedConfig;
  args: DevCommandOptions;
};

export function startDevOutput(options: DevOutputOptions) {
  const { dashboardUrl, config } = options;

  const baseUrl = `${dashboardUrl}/projects/v3/${config.project}`;

  const rebuildStarted = (...[target]: EventBusEventArgs<"rebuildStarted">) => {
    logger.log(chalkGrey("○ Rebuilding background worker…"));
  };

  const buildStarted = (...[target]: EventBusEventArgs<"buildStarted">) => {
    logger.log(chalkGrey("○ Building background worker…"));
  };

  const workerSkipped = () => {
    logger.log(chalkGrey("○ No changes detected, skipping build…"));
  };

  const backgroundWorkerInitialized = (
    ...[worker]: EventBusEventArgs<"backgroundWorkerInitialized">
  ) => {
    const testUrl = `${dashboardUrl}/projects/v3/${config.project}/test?environment=dev`;
    const runsUrl = `${dashboardUrl}/projects/v3/${config.project}/runs?envSlug=dev`;

    const pipe = chalkGrey("|");
    const bullet = chalkGrey("○");
    const arrow = chalkGrey("->");

    const testLink = chalkLink(cliLink("Test tasks", testUrl));
    const runsLink = chalkLink(cliLink("View runs", runsUrl));

    const workerStarted = chalkGrey("Background worker ready");
    const workerVersion = chalkWorker(worker.serverWorker!.version);

    logger.log(
      `${bullet} ${workerStarted} ${arrow} ${workerVersion} ${pipe} ${testLink} ${pipe} ${runsLink}`
    );
  };

  const runStarted = (...[worker, payload]: EventBusEventArgs<"runStarted">) => {
    if (!worker.serverWorker) {
      return;
    }

    const { execution } = payload;

    // ○ Mar 27 09:17:25.653 -> View logs | 20240326.20 | create-avatar | run_slufhjdfiv8ejnrkw9dsj.1
    const logsUrl = `${baseUrl}/runs/${execution.run.id}`;
    const pipe = chalkGrey("|");
    const bullet = chalkGrey("○");
    const link = chalkLink(cliLink("View logs", logsUrl));
    let timestampPrefix = chalkGrey(prettyPrintDate(payload.execution.attempt.startedAt));
    const workerPrefix = chalkWorker(worker.serverWorker.version);
    const taskPrefix = chalkTask(execution.task.id);
    const runId = chalkRun(`${execution.run.id}.${execution.attempt.number}`);

    logger.log(
      `${bullet} ${timestampPrefix} ${chalkGrey(
        "->"
      )} ${link} ${pipe} ${workerPrefix} ${pipe} ${taskPrefix} ${pipe} ${runId}`
    );
  };

  const runCompleted = (
    ...[worker, payload, completion, durationMs]: EventBusEventArgs<"runCompleted">
  ) => {
    const { execution } = payload;

    const retryingText = chalkGrey(
      !completion.ok && completion.skippedRetrying
        ? " (retrying skipped)"
        : !completion.ok && completion.retry !== undefined
        ? ` (retrying in ${completion.retry.delay}ms)`
        : ""
    );

    const resultText = !completion.ok
      ? completion.error.type === "INTERNAL_ERROR" &&
        (completion.error.code === TaskRunErrorCodes.TASK_EXECUTION_ABORTED ||
          completion.error.code === TaskRunErrorCodes.TASK_RUN_CANCELLED)
        ? chalkWarning("Cancelled")
        : `${chalkError("Error")}${retryingText}`
      : chalkSuccess("Success");

    const errorText = !completion.ok
      ? formatErrorLog(completion.error)
      : "retry" in completion
      ? `retry in ${completion.retry}ms`
      : "";

    const elapsedText = chalkGrey(
      `(${formatDurationMilliseconds(durationMs, { style: "short" })})`
    );

    const timestampPrefix = chalkGrey(prettyPrintDate());

    const logsUrl = `${baseUrl}/runs/${execution.run.id}`;
    const pipe = chalkGrey("|");
    const bullet = chalkGrey("○");
    const link = chalkLink(cliLink("View logs", logsUrl));

    const workerPrefix = chalkWorker(worker.serverWorker!.version);
    const taskPrefix = chalkTask(execution.task.id);
    const runId = chalkRun(`${execution.run.id}.${execution.attempt.number}`);

    logger.log(
      `${bullet} ${timestampPrefix} ${chalkGrey(
        "->"
      )} ${link} ${pipe} ${workerPrefix} ${pipe} ${taskPrefix} ${pipe} ${runId} ${pipe} ${resultText} ${elapsedText}${errorText}`
    );
  };

  eventBus.on("rebuildStarted", rebuildStarted);
  eventBus.on("buildStarted", buildStarted);
  eventBus.on("workerSkipped", workerSkipped);
  eventBus.on("backgroundWorkerInitialized", backgroundWorkerInitialized);
  eventBus.on("runStarted", runStarted);
  eventBus.on("runCompleted", runCompleted);

  return () => {
    eventBus.off("rebuildStarted", rebuildStarted);
    eventBus.off("buildStarted", buildStarted);
    eventBus.off("workerSkipped", workerSkipped);
    eventBus.off("backgroundWorkerInitialized", backgroundWorkerInitialized);
    eventBus.off("runStarted", runStarted);
    eventBus.off("runCompleted", runCompleted);
  };
}

function formatErrorLog(error: TaskRunError) {
  switch (error.type) {
    case "INTERNAL_ERROR": {
      return "";
    }
    case "STRING_ERROR": {
      return `\n\n${chalkError("X Error:")} ${error.raw}\n`;
    }
    case "CUSTOM_ERROR": {
      return `\n\n${chalkError("X Error:")} ${error.raw}\n`;
    }
    case "BUILT_IN_ERROR": {
      return `\n\n${error.stackTrace.replace(/^Error: /, chalkError("X Error: "))}\n`;
    }
  }
}