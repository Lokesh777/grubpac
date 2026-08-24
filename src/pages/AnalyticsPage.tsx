import { useMemo, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import { useBoardStore } from '@/stores/boardStore';
import { useThemeStore } from '@/stores/themeStore';
import { useTasksQuery } from '@/hooks/useTasksQuery';
import { getMockSprints } from '@/api/tasks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Task } from '@/types';

function useChartColors() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  return useMemo(() => ({
    indigo: isDark ? '#818cf8' : '#6366f1',
    blue: isDark ? '#60a5fa' : '#3b82f6',
    yellow: isDark ? '#fbbf24' : '#f59e0b',
    green: isDark ? '#4ade80' : '#22c55e',
    gray: isDark ? '#6b7280' : '#9ca3af',
    red: isDark ? '#f87171' : '#ef4444',
    grid: isDark ? '#374151' : '#e5e7eb',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipText: isDark ? '#f3f4f6' : '#374151',
    tooltipBorder: isDark ? '#4b5563' : '#e5e7eb',
    legendText: isDark ? '#9ca3af' : '#6b7280',
    axisText: isDark ? '#9ca3af' : '#6b7280',
  }), [isDark]);
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-lg"
      style={{
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        color: colors.tooltipText,
      }}
    >
      {label && <p className="mb-1 text-sm font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function filterTasksByDateRange(tasks: Task[], startDate: string, endDate: string): Task[] {
  if (!startDate && !endDate) return tasks;
  return tasks.filter((task) => {
    const taskDate = new Date(task.createdAt);
    if (startDate && taskDate < new Date(startDate)) return false;
    if (endDate && taskDate > new Date(endDate + 'T23:59:59')) return false;
    return true;
  });
}

function computeAnalytics(tasks: Task[]) {
  const statusData = [
    { name: 'Backlog', value: tasks.filter((t) => t.columnId === 'backlog').length },
    { name: 'In Progress', value: tasks.filter((t) => t.columnId === 'in-progress').length },
    { name: 'Review', value: tasks.filter((t) => t.columnId === 'review').length },
    { name: 'Done', value: tasks.filter((t) => t.columnId === 'done').length },
  ];

  const priorityData = ['backlog', 'in-progress', 'review', 'done'].map((col) => {
    const colTasks = tasks.filter((t) => t.columnId === col);
    return {
      column: col === 'in-progress' ? 'In Progress' : col.charAt(0).toUpperCase() + col.slice(1),
      low: colTasks.filter((t) => t.priority === 'low').length,
      medium: colTasks.filter((t) => t.priority === 'medium').length,
      high: colTasks.filter((t) => t.priority === 'high').length,
      critical: colTasks.filter((t) => t.priority === 'critical').length,
    };
  });

  const sprints = getMockSprints();
  const sprintVelocity = sprints.map((sprint) => {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
    const completed = sprintTasks.filter((t) => t.columnId === 'done');
    return {
      name: sprint.name,
      completed: completed.length,
      total: sprintTasks.length,
    };
  });

  const completedTasks = tasks.filter((t) => t.completedAt);
  const weeklyCompletion: Record<string, number> = {};
  completedTasks.forEach((task) => {
    const date = new Date(task.completedAt!);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = `Week ${Math.ceil((weekStart.getTime() - new Date('2026-07-20').getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
    weeklyCompletion[weekKey] = (weeklyCompletion[weekKey] || 0) + 1;
  });

  const completionTrend = Object.entries(weeklyCompletion)
    .map(([name, tasks]) => ({ name, tasks }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (completionTrend.length === 0) {
    const totalDone = tasks.filter((t) => t.columnId === 'done').length;
    const perWeek = Math.ceil(totalDone / 4) || 1;
    completionTrend.push(
      { name: 'Week 1', tasks: perWeek },
      { name: 'Week 2', tasks: perWeek * 2 },
      { name: 'Week 3', tasks: perWeek * 3 },
      { name: 'Week 4', tasks: totalDone },
    );
  }

  return { statusData, priorityData, sprintVelocity, completionTrend };
}

const CHART_STYLE_PROPS = [
  'fill',
  'stroke',
  'stroke-width',
  'opacity',
  'font-size',
  'font-family',
  'font-weight',
  'text-anchor',
  'stop-color',
  'stop-opacity',
  'fill-opacity',
  'stroke-opacity',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'dominant-baseline',
  'visibility',
] as const;

function inlineComputedSvgStyles(source: SVGSVGElement, clone: SVGSVGElement) {
  const sourceElements = Array.from(source.querySelectorAll('*'));
  const clonedElements = Array.from(clone.querySelectorAll('*'));

  clonedElements.forEach((cloneNode, index) => {
    const sourceNode = sourceElements[index];
    if (!sourceNode) return;

    const computed = window.getComputedStyle(sourceNode);
    const target = cloneNode as SVGElement;

    CHART_STYLE_PROPS.forEach((property) => {
      const value = computed.getPropertyValue(property).trim();
      if (!value || value === 'none' || value === 'normal') return;
      const resolved = value === 'currentColor' ? computed.color : value;
      if (resolved === 'transparent' || resolved === 'rgba(0, 0, 0, 0)') return;
      target.style.setProperty(property, resolved);
      if (property === 'fill' || property === 'stroke') {
        if (!resolved.startsWith('url(')) {
          target.setAttribute(property, resolved);
        }
      }
    });
  });
}

function stripSvgClipPaths(root: SVGSVGElement) {
  root.querySelectorAll('clipPath').forEach((node) => node.remove());
  root.querySelectorAll('[clip-path], [clipPath]').forEach((node) => {
    node.removeAttribute('clip-path');
    node.removeAttribute('clipPath');
    (node as SVGElement).style.removeProperty('clip-path');
  });
}

function getChartSurfaceSvg(card: HTMLElement): SVGSVGElement | null {
  const direct = card.querySelector(
    ':scope .recharts-wrapper > svg.recharts-surface',
  ) as SVGSVGElement | null;
  if (direct) return direct;

  const surfaces = Array.from(
    card.querySelectorAll('svg.recharts-surface'),
  ).filter((el) => !el.closest('.recharts-legend-wrapper')) as SVGSVGElement[];

  if (!surfaces.length) return null;

  return surfaces.reduce((largest, el) => {
    const a = largest.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return b.width * b.height > a.width * a.height ? el : largest;
  });
}

function readLegendItems(card: HTMLElement) {
  return Array.from(card.querySelectorAll('.recharts-legend-item')).map((item) => {
    const icon = item.querySelector('path, line, rect, circle') as SVGElement | null;
    const labelEl = item.querySelector('.recharts-legend-item-text') as HTMLElement | null;
    const label = (labelEl?.textContent ?? item.textContent ?? '').trim();
    let color = '#6366f1';
    if (icon) {
      const computed = window.getComputedStyle(icon);
      if (computed.fill && computed.fill !== 'none' && computed.fill !== 'rgba(0, 0, 0, 0)') {
        color = computed.fill;
      } else if (icon.getAttribute('fill') && icon.getAttribute('fill') !== 'none') {
        color = icon.getAttribute('fill') as string;
      } else if (computed.stroke && computed.stroke !== 'none') {
        color = computed.stroke;
      }
    }
    return { label, color };
  }).filter((item) => item.label);
}

function appendLegend(
  exportSvg: SVGSVGElement,
  items: Array<{ label: string; color: string }>,
  exportWidth: number,
  legendY: number,
) {
  if (!items.length) return;

  const swatch = 10;
  const gap = 18;
  const charW = 7;
  const widths = items.map((item) => swatch + 6 + item.label.length * charW);
  const total = widths.reduce((sum, w) => sum + w, 0) + gap * (items.length - 1);
  let x = Math.max(16, (exportWidth - total) / 2);

  items.forEach((item, index) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(legendY));
    rect.setAttribute('width', String(swatch));
    rect.setAttribute('height', String(swatch));
    rect.setAttribute('rx', '2');
    rect.setAttribute('fill', item.color);
    exportSvg.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x + swatch + 6));
    text.setAttribute('y', String(legendY + 9));
    text.setAttribute('fill', '#4b5563');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-family', 'system-ui, sans-serif');
    text.textContent = item.label;
    exportSvg.appendChild(text);

    x += widths[index] + gap;
  });
}

function flattenChartSvg(
  clone: SVGSVGElement,
  padding: number,
  width: number,
  height: number,
  extraBottom = 0,
) {
  const exportWidth = width + padding * 2;
  const exportHeight = height + padding * 2 + extraBottom;

  const exportSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  exportSvg.setAttribute('width', String(exportWidth));
  exportSvg.setAttribute('height', String(exportHeight));
  exportSvg.setAttribute('viewBox', `0 0 ${exportWidth} ${exportHeight}`);
  exportSvg.setAttribute('overflow', 'visible');

  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('x', '0');
  background.setAttribute('y', '0');
  background.setAttribute('width', String(exportWidth));
  background.setAttribute('height', String(exportHeight));
  background.setAttribute('fill', '#ffffff');
  exportSvg.appendChild(background);

  // Keep chart nodes in one SVG so url(#id) refs resolve when rasterized.
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  let transform = `translate(${padding}, ${padding})`;
  const vb = clone.getAttribute('viewBox');
  if (vb) {
    const parts = vb.split(/[\s,]+/).map(Number);
    const vbWidth = parts[2] || width;
    const vbHeight = parts[3] || height;
    if (vbWidth > 0 && vbHeight > 0 && (vbWidth !== width || vbHeight !== height)) {
      transform = `translate(${padding}, ${padding}) scale(${width / vbWidth}, ${height / vbHeight})`;
    }
  }
  group.setAttribute('transform', transform);

  Array.from(clone.childNodes).forEach((child) => {
    group.appendChild(child);
  });
  exportSvg.appendChild(group);

  return { exportSvg, exportWidth, exportHeight };
}

function downloadChartPng(element: HTMLElement, filename: string) {
  const svg = getChartSurfaceSvg(element);
  if (!svg) return;

  requestAnimationFrame(() => {
    const rect = svg.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);
    if (!width || !height) return;

    const scale = 2;
    const padding = 40;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const legendItems = readLegendItems(element);
    const legendSpace = legendItems.length ? 28 : 0;

    inlineComputedSvgStyles(svg, clone);
    stripSvgClipPaths(clone);

    const { exportSvg, exportWidth, exportHeight } = flattenChartSvg(
      clone,
      padding,
      width,
      height,
      legendSpace,
    );
    appendLegend(exportSvg, legendItems, exportWidth, height + padding + 8);

    const svgString = new XMLSerializer().serializeToString(exportSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = exportWidth * scale;
      canvas.height = exportHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const url = URL.createObjectURL(pngBlob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.error(`Failed to export ${filename}`);
    };
    img.src = objectUrl;
  });
}

function DownloadButton({ chartKey, filename, exportingChart }: {
  chartKey: string;
  filename: string;
  exportingChart: string | null;
}) {
  const handleClick = useCallback(() => {
    const card = document.querySelector(`[data-chart-card="${chartKey}"]`) as HTMLElement | null;
    if (card) downloadChartPng(card, filename);
  }, [chartKey, filename]);

  return (
    <button
      onClick={handleClick}
      disabled={exportingChart === chartKey}
      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      aria-label={`Export ${chartKey} chart as PNG`}
    >
      {exportingChart === chartKey ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
    </button>
  );
}

export function AnalyticsPage() {
  const board = useBoardStore((s) => s.board);
  const colors = useChartColors();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportingChart, setExportingChart] = useState<string | null>(null);

  const { isLoading } = useTasksQuery();

  const allTasks = useMemo(() => Object.values(board.tasks), [board.tasks]);

  const filteredTasks = useMemo(
    () => filterTasksByDateRange(allTasks, startDate, endDate),
    [allTasks, startDate, endDate]
  );

  const analytics = useMemo(() => computeAnalytics(filteredTasks), [filteredTasks]);

  const pieColors = [colors.indigo, colors.blue, colors.yellow, colors.green];

  const handleClearFilters = useCallback(() => {
    setStartDate('');
    setEndDate('');
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-end">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full sm:w-44"
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full sm:w-44"
        />
        <Button variant="ghost" onClick={handleClearFilters}>
          Clear
        </Button>
      </div>

      <div id="analytics-charts" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div data-chart-card="sprint-velocity" className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sprint Velocity</h3>
            <DownloadButton chartKey="sprint-velocity" filename="sprintdesk-sprint-velocity.png" exportingChart={exportingChart} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.sprintVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.axisText }} />
              <YAxis tick={{ fontSize: 12, fill: colors.axisText }} />
              <Tooltip content={<CustomTooltip colors={colors} />} />
              <Legend wrapperStyle={{ color: colors.legendText }} />
              <Bar dataKey="completed" fill={colors.indigo} name="Completed" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
              <Bar dataKey="total" fill={colors.gray} name="Total" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div data-chart-card="task-status" className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Status Distribution</h3>
            <DownloadButton chartKey="task-status" filename="sprintdesk-task-status.png" exportingChart={exportingChart} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                isAnimationActive
                animationDuration={800}
              >
                {analytics.statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip colors={colors} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div data-chart-card="priority-breakdown" className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Breakdown by Column</h3>
            <DownloadButton chartKey="priority-breakdown" filename="sprintdesk-priority-breakdown.png" exportingChart={exportingChart} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="column"
                tick={{ fontSize: 12, fill: colors.axisText }}
                interval={0}
                height={50}
                tickMargin={10}
              />
              <YAxis tick={{ fontSize: 12, fill: colors.axisText }} />
              <Tooltip content={<CustomTooltip colors={colors} />} />
              <Legend wrapperStyle={{ color: colors.legendText }} />
              <Bar dataKey="low" stackId="a" fill={colors.gray} name="Low" isAnimationActive animationDuration={800} />
              <Bar dataKey="medium" stackId="a" fill={colors.blue} name="Medium" isAnimationActive animationDuration={800} />
              <Bar dataKey="high" stackId="a" fill={colors.yellow} name="High" isAnimationActive animationDuration={800} />
              <Bar dataKey="critical" stackId="a" fill={colors.red} name="Critical" isAnimationActive animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div data-chart-card="completion-trend" className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completion Trend</h3>
            <DownloadButton chartKey="completion-trend" filename="sprintdesk-completion-trend.png" exportingChart={exportingChart} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.completionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.axisText }} />
              <YAxis tick={{ fontSize: 12, fill: colors.axisText }} />
              <Tooltip content={<CustomTooltip colors={colors} />} />
              <Line type="monotone" dataKey="tasks" stroke={colors.indigo} strokeWidth={2} dot={{ r: 4, fill: colors.indigo }} name="Tasks Completed" isAnimationActive animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
