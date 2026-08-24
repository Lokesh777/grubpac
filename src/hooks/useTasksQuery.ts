import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '@/api/tasks';
import { useBoardStore } from '@/stores/boardStore';

export function useTasksQuery() {
  const initialized = useBoardStore((s) => s.initialized);
  const initBoard = useBoardStore((s) => s.initBoard);

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 1000 * 60 * 5,
    enabled: true,
  });

  useEffect(() => {
    if (tasks && tasks.length > 0 && !initialized) {
      initBoard(tasks);
    }
  }, [tasks, initialized, initBoard]);

  return { tasks, isLoading, error };
}
