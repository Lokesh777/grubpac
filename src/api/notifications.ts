export interface PollNotification {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export async function pollNotifications(): Promise<PollNotification[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}
