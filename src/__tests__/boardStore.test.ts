import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '@/stores/boardStore';
import type { Task } from '@/types';

const mockTask: Task = {
  id: 100,
  title: 'Test Task',
  description: 'Test description',
  priority: 'medium',
  assignee: 'Test User',
  assigneeAvatar: 'https://i.pravatar.cc/150?u=test',
  dueDate: '2026-08-25',
  columnId: 'backlog',
  order: 0,
  comments: [],
  createdAt: '2026-08-20T10:00:00Z',
  completedAt: null,
  updatedAt: '2026-08-20T10:00:00Z',
  sprintId: 4,
};

const mockTask2: Task = {
  ...mockTask,
  id: 101,
  title: 'Test Task 2',
  columnId: 'in-progress',
  order: 0,
};

describe('boardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({
      board: {
        columns: {
          'backlog': { id: 'backlog', title: 'Backlog', taskIds: [] },
          'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
          'review': { id: 'review', title: 'Review', taskIds: [] },
          'done': { id: 'done', title: 'Done', taskIds: [] },
        },
        tasks: {},
      },
      initialized: false,
    });
  });

  it('should initialize board with tasks', () => {
    const { initBoard } = useBoardStore.getState();
    initBoard([mockTask, mockTask2]);
    const { board } = useBoardStore.getState();
    expect(Object.keys(board.tasks)).toHaveLength(2);
    expect(board.columns['backlog'].taskIds).toContain(100);
    expect(board.columns['in-progress'].taskIds).toContain(101);
  });

  it('should add a task', () => {
    const { addTask } = useBoardStore.getState();
    addTask(mockTask);
    const { board } = useBoardStore.getState();
    expect(board.tasks[100]).toBeDefined();
    expect(board.columns['backlog'].taskIds).toContain(100);
  });

  it('should delete a task', () => {
    const { addTask, deleteTask } = useBoardStore.getState();
    addTask(mockTask);
    deleteTask(100);
    const { board } = useBoardStore.getState();
    expect(board.tasks[100]).toBeUndefined();
    expect(board.columns['backlog'].taskIds).not.toContain(100);
  });

  it('should move a task between columns', () => {
    const { addTask, moveTask } = useBoardStore.getState();
    addTask(mockTask);
    moveTask(100, 'backlog', 'in-progress', 0);
    const { board } = useBoardStore.getState();
    expect(board.columns['backlog'].taskIds).not.toContain(100);
    expect(board.columns['in-progress'].taskIds).toContain(100);
    expect(board.tasks[100].columnId).toBe('in-progress');
  });

  it('should reorder tasks within a column', () => {
    const taskA = { ...mockTask, id: 200, order: 0 };
    const taskB = { ...mockTask, id: 201, order: 1 };
    const { addTask, reorderTask } = useBoardStore.getState();
    addTask(taskA);
    addTask(taskB);
    reorderTask('backlog', 0, 1);
    const { board } = useBoardStore.getState();
    expect(board.columns['backlog'].taskIds[0]).toBe(201);
    expect(board.columns['backlog'].taskIds[1]).toBe(200);
  });

  it('should add a comment to a task', () => {
    const { addTask, addComment } = useBoardStore.getState();
    addTask(mockTask);
    addComment(100, { id: 1, userId: 1, userName: 'Test', text: 'Hello', createdAt: '2026-08-20T10:00:00Z' });
    const { board } = useBoardStore.getState();
    expect(board.tasks[100].comments).toHaveLength(1);
    expect(board.tasks[100].comments[0].text).toBe('Hello');
  });

  it('should update a task', () => {
    const { addTask, updateTask } = useBoardStore.getState();
    addTask(mockTask);
    updateTask(100, { title: 'Updated Title' });
    const { board } = useBoardStore.getState();
    expect(board.tasks[100].title).toBe('Updated Title');
  });

  it('should return tasks by column', () => {
    const { addTask, getTasksByColumn } = useBoardStore.getState();
    addTask(mockTask);
    addTask(mockTask2);
    const backlogTasks = getTasksByColumn('backlog');
    expect(backlogTasks).toHaveLength(1);
    expect(backlogTasks[0].id).toBe(100);
  });
});
