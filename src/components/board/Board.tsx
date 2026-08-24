import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskDrawer } from './TaskDrawer';
import { AddTaskModal } from './AddTaskModal';
import { Button } from '@/components/ui/Button';
import { useBoardStore } from '@/stores/boardStore';
import { useTasksQuery } from '@/hooks/useTasksQuery';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Task, ColumnId } from '@/types';

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export function Board() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const board = useBoardStore((s) => s.board);
  const moveTask = useBoardStore((s) => s.moveTask);
  const reorderTask = useBoardStore((s) => s.reorderTask);

  const { isLoading } = useTasksQuery();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumn = useCallback(
    (taskId: number): ColumnId | undefined => {
      for (const col of COLUMNS) {
        if (board.columns[col.id].taskIds.includes(taskId)) {
          return col.id;
        }
      }
      return undefined;
    },
    [board]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = board.tasks[active.id as number];
      if (task) setSelectedTask(task);
    },
    [board]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as number;
      const overId = over.id as string | number;

      const activeCol = findColumn(activeId);
      let overCol = findColumn(overId as number);

      if (!overCol) {
        const overStr = String(overId);
        if (COLUMNS.some((c) => c.id === overStr)) {
          overCol = overStr as ColumnId;
        }
      }

      if (!activeCol || !overCol || activeCol === overCol) return;

      const overTaskIds = board.columns[overCol].taskIds;
      const overIndex = overTaskIds.indexOf(overId as number);
      const newIndex = overIndex >= 0 ? overIndex : overTaskIds.length;

      moveTask(activeId, activeCol, overCol, newIndex);
    },
    [board, findColumn, moveTask]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const activeId = active.id as number;
      const overId = over.id as number;

      if (activeId === overId) return;

      const activeCol = findColumn(activeId);
      const overCol = findColumn(overId);

      if (activeCol === overCol && activeCol) {
        const taskIds = board.columns[activeCol].taskIds;
        const oldIndex = taskIds.indexOf(activeId);
        const newIndex = taskIds.indexOf(overId);
        if (oldIndex !== newIndex) {
          reorderTask(activeCol, oldIndex, newIndex);
        }
      }
    },
    [board, findColumn, reorderTask]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint Board</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {['Backlog', 'In Progress', 'Review', 'Done'].map((title) => (
            <div key={title} className="min-w-[280px] flex-1 rounded-lg bg-gray-100 dark:bg-gray-800/50 p-4">
              <Skeleton className="mb-4 h-5 w-24" />
              <Skeleton className="mb-3 h-24 w-full" />
              <Skeleton className="mb-3 h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint Board</h2>
        <Button onClick={() => setAddModalOpen(true)}>+ New Task</Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={board.columns[col.id].taskIds
                .map((id) => board.tasks[id])
                .filter(Boolean)}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
      </DndContext>

      <TaskDrawer
        task={selectedTask}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTask(null);
        }}
      />

      <AddTaskModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
