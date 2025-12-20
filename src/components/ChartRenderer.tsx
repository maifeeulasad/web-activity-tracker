import React from 'react';
import { Card, Empty, Spin } from 'antd';
import { CHART_TYPES } from '../utils/visualizationConfig';

interface ChartRendererProps {
  chartId: string;
  data: unknown[];
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  customConfig?: Record<string, unknown>;
  height?: number;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartId,
  data,
  title,
  description,
  loading = false,
  error = null,
  customConfig = {},
  height
}) => {
  const chartConfig = CHART_TYPES[chartId];
  
  if (!chartConfig) {
    return (
      <Card title={title || 'Unknown Chart'}>
        <Empty description="Chart type not found" />
      </Card>
    );
  }
  
  if (loading) {
    return (
      <Card title={title || chartConfig.title}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height || chartConfig.height }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card title={title || chartConfig.title}>
        <Empty description={error} />
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card 
        title={title || chartConfig.title}
        extra={description && <span style={{ fontSize: '12px', color: '#666' }}>{description}</span>}
      >
        <Empty description="No data available for the selected period" />
      </Card>
    );
  }
  
  const finalConfig: Record<string, unknown> = {
    ...chartConfig.defaultConfig,
    ...(customConfig || {}),
    height: height ?? chartConfig.height,
  };
  const finalHeight = finalConfig.height as unknown as string | number | undefined;
  
  return (
    <Card 
      title={title || chartConfig.title}
      extra={description && <span style={{ fontSize: '12px', color: '#666' }}>{description}</span>}
      style={{ height: 'auto' }}
    >
      <div style={{ height: finalHeight }}>
        {chartConfig.render(data, finalConfig)}
      </div>
    </Card>
  );
};

export default ChartRenderer;