/**
 * Background Script
 * Service worker for batch extraction and API sync
 */

import type { JobData, ExtractionProgress, MessageRequest, MessageResponse, ExtractionResult } from "@/types/jd";
import { apiClient } from "./api-client";
import { storage } from "@/utils/storage";

// Extraction state
interface ExtractionState {
  isRunning: boolean;
  jobs: JobData[];
  currentIndex: number;
  results: JobData[];
  errors: Array<{ job: JobData; error: string }>;
  startTime: number | null;
  cancelRequested: boolean;
}

let extractionState: ExtractionState = {
  isRunning: false,
  jobs: [],
  currentIndex: 0,
  results: [],
  errors: [],
  startTime: null,
  cancelRequested: false,
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(2000 + Math.random() * 3000);

function broadcastProgress(progress: ExtractionProgress) {
  chrome.runtime.sendMessage({
    action: "extractionProgress",
    ...progress,
  }).catch(() => {});
}

async function syncToApi(result: ExtractionResult): Promise<MessageResponse> {
  const config = await storage.getConfig();
  if (!config.autoSync) {
    return { success: true, data: { synced: false } };
  }
  if (!config.userToken) {
    return { success: false, error: "No token configured" };
  }
  try {
    if (result.pageType === "list" && "jobs" in result.data) {
      await apiClient.syncJobs(result.data.jobs);
    } else if (result.pageType === "detail") {
      await apiClient.syncJob(result.data as JobData);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sync failed",
    };
  }
}

async function extractJobDetail(jobUrl: string, timeout = 15000): Promise<{ success: boolean; data?: JobData; error?: string }> {
  let tabId: number | undefined;
  try {
    const tab = await chrome.tabs.create({ url: jobUrl, active: false });
    if (!tab.id) throw new Error("Failed to create tab");
    tabId = tab.id;
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error("Timeout")), timeout);
      const listener = (updatedTabId: number, info: chrome.tabs.TabChangeInfo) => {
        if (updatedTabId === tabId && info.status === "complete") {
          clearTimeout(timeoutId);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
    await delay(2000);
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"],
      });
    } catch (e) {}
    await delay(500);
    const response = await new Promise<ExtractionResult>((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error("Timeout")), 8000);
      chrome.tabs.sendMessage(tabId!, { action: "extract" }, (resp) => {
        clearTimeout(timeoutId);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(resp);
        }
      });
    });
    if (response.success && "jobName" in response.data) {
      return { success: true, data: response.data as JobData };
    }
    throw new Error(response.error || "Extraction failed");
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  } finally {
    if (tabId) {
      try {
        await chrome.tabs.remove(tabId);
      } catch (e) {}
    }
  }
}

async function batchExtract(jobs: JobData[], _pageUrl: string) {
  if (extractionState.isRunning) {
    throw new Error("Already running");
  }
  extractionState = {
    isRunning: true,
    jobs,
    currentIndex: 0,
    results: [],
    errors: [],
    startTime: Date.now(),
    cancelRequested: false,
  };
  broadcastProgress({ status: "started", total: jobs.length, message: "Starting..." });
  for (let i = 0; i < jobs.length; i++) {
    if (extractionState.cancelRequested) {
      broadcastProgress({ status: "cancelled", message: "Cancelled" });
      break;
    }
    const job = jobs[i];
    extractionState.currentIndex = i;
    broadcastProgress({
      status: "progress",
      current: i + 1,
      total: jobs.length,
      message: `Extracting ${i + 1}/${jobs.length}...`,
    });
    try {
      const result = await extractJobDetail(job.url);
      if (result.success && result.data) {
        extractionState.results.push({ ...job, ...result.data });
      } else {
        extractionState.errors.push({ job, error: result.error || "Failed" });
        extractionState.results.push(job);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed";
      extractionState.errors.push({ job, error: errorMsg });
      extractionState.results.push(job);
    }
    if (i < jobs.length - 1 && !extractionState.cancelRequested) {
      broadcastProgress({ status: "waiting", message: "Waiting...", current: i + 1, total: jobs.length });
      await randomDelay();
    }
  }
  extractionState.isRunning = false;
  const duration = extractionState.startTime ? Math.round((Date.now() - extractionState.startTime) / 1000) : 0;
  broadcastProgress({
    status: "completed",
    total: jobs.length,
    current: jobs.length,
    message: `Done! ${extractionState.results.length} success, ${extractionState.errors.length} failed`,
  });
  const config = await storage.getConfig();
  if (config.autoSync && config.userToken) {
    await apiClient.syncJobs(extractionState.results);
  }
  return {
    results: extractionState.results,
    count: extractionState.results.length,
    errors: extractionState.errors,
    duration,
  };
}

chrome.runtime.onMessage.addListener((request: MessageRequest, _sender, sendResponse: (response: MessageResponse) => void) => {
  const handleAsync = async () => {
    switch (request.action) {
      case "syncToApi": {
        const lastExtraction = await storage.getLastExtraction();
        if (!lastExtraction) {
          sendResponse({ success: false, error: "No extraction data" });
          return;
        }
        const result = await syncToApi({
          success: true,
          pageType: lastExtraction.type,
          data: lastExtraction.data as JobData,
          markdown: lastExtraction.markdown
        });
        sendResponse(result);
        break;
      }
      case "batchExtract":
        if (request.jobs && request.pageUrl) {
          try {
            const result = await batchExtract(request.jobs, request.pageUrl);
            sendResponse({ success: true, data: result });
          } catch (error) {
            sendResponse({ success: false, error: error instanceof Error ? error.message : "Failed" });
          }
        } else {
          sendResponse({ success: false, error: "Missing params" });
        }
        break;
      case "cancelExtraction":
        extractionState.cancelRequested = true;
        sendResponse({ success: true });
        break;
      case "getStatus":
        sendResponse({
          success: true,
          data: {
            isRunning: extractionState.isRunning,
            current: extractionState.currentIndex,
            total: extractionState.jobs.length,
          },
        });
        break;
      case "getConfig": {
        const config = await storage.getConfig();
        sendResponse({ success: true, data: config });
        break;
      }
      case "setConfig":
        if (request.config) {
          await storage.setConfig(request.config);
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: "No config" });
        }
        break;
      default:
        sendResponse({ success: false, error: "Unknown action" });
    }
  };
  handleAsync();
  return true;
});

console.log("[JD Extractor] Background script loaded");
