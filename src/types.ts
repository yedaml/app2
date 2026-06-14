/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  sender: string;
  timestamp: Date | null;
  text: string;
}

export interface ParticipantMetrics {
  sender: string;
  messageCount: number;
  messageRate: number; // percentage of total messages
  wordCount: number;
  characterCount: number;
  avgCharCount: number; // average message length (characters)
  questionCount: number; // question mark counts
  questionRate: number; // percentage of messages with '?'
  initiateCount: number; // number of times initiating after a 2-hour gap
  initiateRate: number; // percentage of total conversation starters initiated
  endCount: number; // number of times ending a session before a 2-hour gap
  endRate: number; // percentage of total conversations closed
  avgResponseTime: number; // in seconds (for active response chains < 1hr)
  hourlyDistribution: number[]; // 24 hours
  dominantTimeLabel: string; // e.g. "심야 집중형", "오후 소통형"
  styleTag: string; // Title style tag (e.g., "다정한 대화 촉진자")
  traits: string[]; // Positive behavioral characteristics instead of grading
  detailedDescription: string; // Human explanation of this person's messaging habits
}

export interface SavedAnalysis {
  id: string;
  title: string;
  createdAt: string;
  rawText: string;
  participants: ParticipantMetrics[];
  totalMessages: number;
}
