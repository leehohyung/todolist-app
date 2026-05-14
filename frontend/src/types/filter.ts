export type CompletionStatus = 'all' | 'completed' | 'incomplete';

export interface TodoFilter {
  categoryId?: string;
  dueDate?: string;
  isCompleted?: boolean;
}

export interface FilterState {
  categoryId: string;
  dueDate: string;
  completionStatus: CompletionStatus;
}
