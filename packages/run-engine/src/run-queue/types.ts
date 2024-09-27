import { z } from "zod";
import { AuthenticatedEnvironment } from "../shared/index.js";
import { RuntimeEnvironmentType } from "@trigger.dev/database";
import { env } from "process";

export const MessagePayload = z.object({
  version: z.literal("1"),
  runId: z.string(),
  taskIdentifier: z.string(),
  orgId: z.string(),
  projectId: z.string(),
  environmentId: z.string(),
  environmentType: z.nativeEnum(RuntimeEnvironmentType),
  queue: z.string(),
  timestamp: z.number(),
  concurrencyKey: z.string().optional(),
});

export type MessagePayload = z.infer<typeof MessagePayload>;

export type QueueCapacity = {
  current: number;
  limit: number;
};

export type QueueCapacities = {
  queue: QueueCapacity;
  env: QueueCapacity;
};

export type QueueWithScores = {
  queue: string;
  capacities: QueueCapacities;
  age: number;
  size: number;
};

export type QueueRange = { offset: number; count: number };

export interface RunQueueKeyProducer {
  envSharedQueueKey(env: AuthenticatedEnvironment): string;
  sharedQueueKey(): string;
  sharedQueueScanPattern(): string;
  queueCurrentConcurrencyScanPattern(): string;
  //queue
  queueKey(env: AuthenticatedEnvironment, queue: string, concurrencyKey?: string): string;
  queueConcurrencyLimitKey(env: AuthenticatedEnvironment, queue: string): string;
  concurrencyLimitKeyFromQueue(queue: string): string;
  currentConcurrencyKeyFromQueue(queue: string): string;
  currentConcurrencyKey(
    env: AuthenticatedEnvironment,
    queue: string,
    concurrencyKey?: string
  ): string;
  disabledConcurrencyLimitKeyFromQueue(queue: string): string;
  //env oncurrency
  envCurrentConcurrencyKey(env: AuthenticatedEnvironment): string;
  envConcurrencyLimitKey(env: AuthenticatedEnvironment): string;
  envConcurrencyLimitKeyFromQueue(queue: string): string;
  envCurrentConcurrencyKeyFromQueue(queue: string): string;
  //task concurrency
  taskIdentifierCurrentConcurrencyKey(
    env: AuthenticatedEnvironment,
    taskIdentifier: string
  ): string;
  taskIdentifierCurrentConcurrencyKeyPrefixFromQueue(queue: string): string;
  taskIdentifierCurrentConcurrencyKeyFromQueue(queue: string, taskIdentifier: string): string;
  //project concurrency
  projectCurrentConcurrencyKey(env: AuthenticatedEnvironment): string;
  projectCurrentConcurrencyKeyFromQueue(queue: string): string;
  //message payload
  messageKeyPrefixFromQueue(queue: string): string;
  messageKey(orgId: string, messageId: string): string;
  //utils
  stripKeyPrefix(key: string): string;
  extractComponentsFromQueue(queue: string): {
    orgId: string;
    projectId: string;
    envId: string;
    queue: string;
    concurrencyKey: string | undefined;
  };
}

export type PriorityStrategyChoice = string | { abort: true };

export interface RunQueuePriorityStrategy {
  /**
   * chooseQueue is called to select the next queue to process a message from
   *
   * @param queues
   * @param parentQueue
   * @param consumerId
   *
   * @returns The queue to process the message from, or an object with `abort: true` if no queue is available
   */
  chooseQueue(
    queues: Array<QueueWithScores>,
    parentQueue: string,
    consumerId: string,
    previousRange: QueueRange
  ): { choice: PriorityStrategyChoice; nextRange: QueueRange };

  /**
   * This function is called to get the next candidate selection for the queue
   * The `range` is used to select the set of queues that will be considered for the next selection (passed to chooseQueue)
   * The `selectionId` is used to identify the selection and should be passed to chooseQueue
   *
   * @param parentQueue The parent queue that holds the candidate queues
   * @param consumerId The consumerId that is making the request
   *
   * @returns The scores and the selectionId for the next candidate selection
   */
  nextCandidateSelection(parentQueue: string, consumerId: string): Promise<{ range: QueueRange }>;
}
