import React from 'react';
import { Line, Area, Column, Pie } from '@ant-design/plots';

export type DateRange = {
  label: string;
  value: string;
  getDates: () => [Date, Date];
};

export const DATE_RANGES: DateRange[] = [
  {
    label: 'Last 7 days',
    value: '7d',
    getDates: () => [new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date()],
  },
  {
    label: 'Last 30 days',
    value: '30d',
    getDates: () => [new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), new Date()],
  },
  {
    label: 'This month',
    value: 'month',
    getDates: () => {
      const now = new Date();
      return [new Date(now.getFullYear(), now.getMonth(), 1), now];
    }
  }
];

export type ChartType = 'line' | 'area' | 'column' | 'pie';

export type ChartConfig = {
  title: string;
  type: ChartType;
  defaultConfig?: Record<string, unknown>;
  height?: number;
  render: (data: unknown[], config: Record<string, unknown>) => React.ReactNode;
};

export const CHART_TYPES: Record<string, ChartConfig> = {
  timeTrend: {
    title: 'Time Trend',
    type: 'line',
    defaultConfig: {},
    height: 300,
    render: (data, config) => {
      const d = data as Array<Record<string, unknown>>;
      return React.createElement(Line, {
        data: d,
        xField: 'date',
        yField: 'time',
        smooth: true,
        height: (config.height as number) || 300,
      });
    }
  },
  weeklyOverview: {
    title: 'Weekly Overview',
    type: 'area',
    defaultConfig: {},
    height: 280,
    render: (data, config) => {
      const d = data as Array<Record<string, unknown>>;
      return React.createElement(Area, {
        data: d,
        xField: 'url',
        yField: 'time',
        height: (config.height as number) || 280,
      });
    }
  },
  siteBreakdown: {
    title: 'Site Breakdown',
    type: 'pie',
    defaultConfig: {},
    height: 300,
    render: (data, config) => {
      const d = data as Array<Record<string, unknown>>;
      const pieData = d.map(item => ({ type: (item['url'] ?? item['site']) as string, value: Number(item['time']) }));
      return React.createElement(Pie, {
        data: pieData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        height: (config.height as number) || 300,
      });
    }
  },
  productivityTrend: {
    title: 'Productivity Trend',
    type: 'column',
    defaultConfig: {},
    height: 300,
    render: (data, config) => {
      const d = data as Array<Record<string, unknown>>;
      return React.createElement(Column, {
        data: d,
        xField: 'date',
        yField: 'productivity',
        height: (config.height as number) || 300,
      });
    }
  },
  hourlyPattern: {
    title: 'Hourly Pattern',
    type: 'column',
    defaultConfig: {},
    height: 250,
    render: (data, config) => {
      const d = data as Array<Record<string, unknown>>;
      return React.createElement(Column, {
        data: d,
        xField: 'hour',
        yField: 'time',
        height: (config.height as number) || 250,
      });
    }
  },
  sessionAnalysis: {
    title: 'Session Analysis',
    type: 'line',
    defaultConfig: {},
    height: 300,
    render: (data, config) => {
      const d = data as Array<Record<string, unknown>>;
      return React.createElement(Line, {
        data: d,
        xField: 'date',
        yField: 'sessions',
        height: (config.height as number) || 300,
      });
    }
  },
  dailyActivity: {
    title: 'Daily Activity',
    type: 'area',
    defaultConfig: {},
    height: 300,
    render: (data, config) => {
      const d = data as Array<Record<string, unknown>>;
      return React.createElement(Area, {
        data: d,
        xField: 'date',
        yField: 'total',
        height: (config.height as number) || 300,
      });
    }
  }
};

export type VisualizationConfig = {
  preset: string;
  dateRange: string;
  customDateRange?: [Date, Date] | null;
};

export const CHART_PRESETS = [
  { id: 'overview', title: 'Overview', defaultDateRange: '7d', charts: ['timeTrend', 'dailyActivity', 'weeklyOverview'] },
  { id: 'productivity', title: 'Productivity', defaultDateRange: '7d', charts: ['productivityTrend', 'timeTrend'] },
];

export const DEFAULT_VISUALIZATION_CONFIG: VisualizationConfig = {
  preset: 'overview',
  dateRange: '7d',
  customDateRange: null,
};
