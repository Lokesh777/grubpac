import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, ColumnId, Board } from '@/types';

interface BoardState {
  board: Board;
  previousBoard: Board | null;
  initialized: boolean;
  initBoard: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  deleteTask: (taskId: number) => void;
  moveTask: (taskId: number, fromColumn: ColumnId, toColumn: ColumnId, newIndex: number) => void;
  reorderTask: (columnId: ColumnId, oldIndex: number, newIndex: number) => void;
  addComment: (taskId: number, comment: Task['comments'][0]) => void;
  getTasksByColumn: (columnId: ColumnId) => Task[];
  saveSnapshot: () => void;
  undoLastAction: () => void;
  canUndo: () => boolean;
}

const createEmptyBoard = (): Board => ({
  columns: {
    'backlog': { id: 'backlog', title: 'Backlog', taskIds: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
    'review': { id: 'review', title: 'Review', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] },
  },
  tasks: {},
});

function cloneBoard(board: Board): Board {
  return {
    columns: {
      'backlog': { ...board.columns['backlog'], taskIds: [...board.columns['backlog'].taskIds] },
      'in-progress': { ...board.columns['in-progress'], taskIds: [...board.columns['in-progress'].taskIds] },
      'review': { ...board.columns['review'], taskIds: [...board.columns['review'].taskIds] },
      'done': { ...board.columns['done'], taskIds: [...board.columns['done'].taskIds] },
    },
    tasks: { ...board.tasks },
  };
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      board: createEmptyBoard(),
      previousBoard: null,
      initialized: false,

      initBoard: (tasks) => {
        const board = createEmptyBoard();
        const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
        sortedTasks.forEach((task) => {
          board.tasks[task.id] = task;
          if (board.columns[task.columnId]) {
            board.columns[task.columnId].taskIds.push(task.id);
          }
        });
        set({ board, initialized: true });
      },

      saveSnapshot: () => {
        const { board } = get();
        set({ previousBoard: cloneBoard(board) });
      },

      undoLastAction: () => {
        const { previousBoard } = get();
        if (previousBoard) {
          set({ board: previousBoard, previousBoard: null });
        }
      },

      canUndo: () => get().previousBoard !== null,

      addTask: (task) => {
        const board = get().board;
        const column = board.columns[task.columnId];
        const newBoard = {
          ...board,
          columns: {
            ...board.columns,
            [task.columnId]: {
              ...column,
              taskIds: [...column.taskIds, task.id],
            },
          },
          tasks: { ...board.tasks, [task.id]: task },
        };
        set({ board: newBoard });
      },

      updateTask: (taskId, updates) => {
        const board = get().board;
        const existingTask = board.tasks[taskId];
        if (!existingTask) return;
        const updatedTask = { ...existingTask, ...updates };
        set({
          board: {
            ...board,
            tasks: { ...board.tasks, [taskId]: updatedTask },
          },
        });
      },

      deleteTask: (taskId) => {
        const board = get().board;
        const task = board.tasks[taskId];
        if (!task) return;
        const column = board.columns[task.columnId];
        const newColumns = {
          ...board.columns,
          [task.columnId]: {
            ...column,
            taskIds: column.taskIds.filter((id) => id !== taskId),
          },
        };
        const newTasks = { ...board.tasks };
        delete newTasks[taskId];
        set({ board: { columns: newColumns, tasks: newTasks } });
      },

      moveTask: (taskId, fromColumn, toColumn, newIndex) => {
        const board = get().board;
        const fromCol = board.columns[fromColumn];
        const toCol = board.columns[toColumn];
        const newFromIds = fromCol.taskIds.filter((id) => id !== taskId);
        const newToIds = [...toCol.taskIds];
        newToIds.splice(newIndex, 0, taskId);
        const task = board.tasks[taskId];
        if (task) {
          const updatedTask = { ...task, columnId: toColumn, order: newIndex };
          set({
            board: {
              ...board,
              columns: {
                ...board.columns,
                [fromColumn]: { ...fromCol, taskIds: newFromIds },
                [toColumn]: { ...toCol, taskIds: newToIds },
              },
              tasks: { ...board.tasks, [taskId]: updatedTask },
            },
          });
        }
      },

      reorderTask: (columnId, oldIndex, newIndex) => {
        const board = get().board;
        const column = board.columns[columnId];
        const newIds = [...column.taskIds];
        const [removed] = newIds.splice(oldIndex, 1);
        newIds.splice(newIndex, 0, removed);
        set({
          board: {
            ...board,
            columns: {
              ...board.columns,
              [columnId]: { ...column, taskIds: newIds },
            },
          },
        });
      },

      addComment: (taskId, comment) => {
        const board = get().board;
        const task = board.tasks[taskId];
        if (!task) return;
        const updatedTask = { ...task, comments: [...task.comments, comment] };
        set({
          board: { ...board, tasks: { ...board.tasks, [taskId]: updatedTask } },
        });
      },

      getTasksByColumn: (columnId) => {
        const board = get().board;
        const column = board.columns[columnId];
        return column.taskIds.map((id) => board.tasks[id]).filter(Boolean);
      },
    }),
    { name: 'sprintdesk-board' }
  )
);
