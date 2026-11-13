export type Lang = "fr" | "ar";

export interface Child {
  id: string;
  name: string;
  age: number;
  language: Lang;
}

export type ActivityKind = "choice" | "trace" | "memory" | "story";
export type ActivityState = "completed" | "available" | "locked";

export interface ActivitySummary {
  id: string;
  universe_id: string;
  position: number;
  kind: ActivityKind;
  title_fr: string;
  title_ar: string;
  completed: boolean;
  best_ratio: number;
  status: ActivityState;
}

export interface Universe {
  id: string;
  position: number;
  name_fr: string;
  name_ar: string;
  description_fr: string;
  description_ar: string;
  color: string;
  activities: ActivitySummary[];
  progress: number;
}

export interface QuestionPayload {
  fr?: string;
  ar?: string;
  visual?: string;
  audio?: string;
  fallback?: string;
  trace?: string;
  hide?: boolean;
}

export interface Question {
  id: string;
  payload: QuestionPayload;
  options: string[];
}

export interface Session {
  sessionId: string;
  activity: {
    id: string;
    universe_id: string;
    kind: ActivityKind;
    title_fr: string;
    title_ar: string;
    config: { storyId?: string; narrate?: boolean };
  };
  mastery: number;
  questions: Question[];
}

export interface AnswerResult {
  correct: boolean;
  choice: number;
  correctIndex: number;
}

export interface Reward {
  id: string;
  kind: "thread" | "patch" | "badge";
  name_fr: string;
  name_ar: string;
  universe_id: string | null;
  earned_at?: string;
}

export interface CompleteResult {
  correct: number;
  total: number;
  passed: boolean;
  activityId: string;
  universeId: string;
  perQuestion: { questionId: string; correct: boolean }[];
  newRewards: Reward[];
}

export interface StoryScene {
  art: string;
  fr: string;
  ar: string;
  audio?: string;
}

export interface Story {
  id: string;
  title_fr: string;
  title_ar: string;
  scenes: StoryScene[];
}

export interface DashboardUniverse {
  universe_id: string;
  name_fr: string;
  name_ar: string;
  total: number;
  completed: number;
  avg_score: number;
  attempts: number;
}

export interface Dashboard {
  overall: number;
  universes: DashboardUniverse[];
}
