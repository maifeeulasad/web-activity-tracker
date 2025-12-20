// Main visualization panel component
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Button, Space, Divider, Tabs } from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined, 
  AreaChartOutlined,
  FullscreenOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useTracker } from '../hooks/useTracker';
import { Tab, TimeInterval } from '../types';
import { 
  CHART_TYPES, 
  CHART_PRESETS, 
  DATE_RANGES,
  DEFAULT_VISUALIZATION_CONFIG,
  VisualizationConfig 
} from '../utils/visualizationConfig';
import { 
  prepareTimeTrendData,
  prepareDailyActivityData,
  prepareSiteBreakdownData,
  prepareProductivityTrendData,
  prepareHourlyPatternData,
  prepareSessionAnalysisData,
  prepareWeeklyOverviewData,
  calculateRangeStats
} from '../utils/visualizationData';
import ChartRenderer from './ChartRenderer';
import DateRangeSelector from './DateRangeSelector';

const { Option } = Select;
const { TabPane } = Tabs;

interface VisualizationPanelProps {
  preset?: string;
  height?: number;
  showControls?: boolean;
  compact?: boolean;
  tabs?: Tab[];
  timeIntervals?: TimeInterval[];
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  preset = 'overview',
  height = 400,
  showControls = true,
  compact = false,
  tabs: propsTabs,
  timeIntervals: propsTimeIntervals,
}) => {
  const tracker = useTracker();
  const tabs = propsTabs ?? tracker.tabs;
  const timeIntervals = propsTimeIntervals ?? tracker.timeIntervals;
  const [config, setConfig] = useState<VisualizationConfig>({
    ...DEFAULT_VISUALIZATION_CONFIG,
    preset
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  type RangeStats = {
    totalTime: number;
    totalSessions: number;
    uniqueSites: number;
    productivityScore: number;
  } | null;

  const [stats, setStats] = useState<RangeStats>(null);
  
  // Get current date range
  const getCurrentDateRange = (): [Date, Date] => {
    if (config.customDateRange) {
      return config.customDateRange;
    }
    
    const rangeObj = DATE_RANGES.find((r: { value: string }) => r.value === config.dateRange);
    
    if (rangeObj) {
      return rangeObj.getDates();
    }
    
    // Default to this week
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return [startOfWeek, endOfWeek];
  };
  
  const [startDate, endDate] = getCurrentDateRange();
  
  // Prepare data for different chart types
  const chartData = {
    timeTrend: prepareTimeTrendData(tabs, timeIntervals, startDate, endDate),
    dailyActivity: prepareDailyActivityData(tabs, startDate, endDate),
    siteBreakdown: prepareSiteBreakdownData(tabs, startDate, endDate),
    productivityTrend: prepareProductivityTrendData(tabs, startDate, endDate),
    hourlyPattern: prepareHourlyPatternData(timeIntervals, new Date()),
    sessionAnalysis: prepareSessionAnalysisData(tabs, startDate, endDate),
    weeklyOverview: prepareWeeklyOverviewData(tabs)
  };
  
  // Calculate summary statistics
  useEffect(() => {
    const rangeStats = calculateRangeStats(tabs, startDate, endDate);
    setStats(rangeStats);
  }, [tabs, startDate, endDate]);
  
  const handlePresetChange = (presetId: string) => {
    const preset = CHART_PRESETS.find((p: { id: string }) => p.id === presetId);
    if (preset) {
      setConfig(prev => ({
        ...prev,
        preset: presetId,
        dateRange: preset.defaultDateRange
      }));
    }
  };
  
  const handleDateRangeChange = (range: string, customRange?: [Date, Date]) => {
    setConfig(prev => ({
      ...prev,
      dateRange: range as VisualizationConfig['dateRange'],
      customDateRange: customRange || null
    }));
  };
  
  const handleRefresh = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => setLoading(false), 500);
  };
  
  const getChartIcon = (chartId: string) => {
    const chart = CHART_TYPES[chartId];
    switch (chart?.type) {
      case 'line':
        return <LineChartOutlined />;
      case 'area':
        return <AreaChartOutlined />;
      case 'column':
        return <BarChartOutlined />;
      case 'pie':
        return <PieChartOutlined />;
      default:
        return <BarChartOutlined />;
    }
  };
  
  if (compact) {
    // Compact view for dashboard
    return (
      <Card title="Weekly Overview" style={{ height }}>
        <DateRangeSelector
          selectedRange={config.dateRange}
          customDateRange={config.customDateRange}
          onRangeChange={handleDateRangeChange}
          disabled={loading}
        />
        
        <div style={{ height: height - 120 }}>
          <ChartRenderer
            chartId="timeTrend"
            data={chartData.weeklyOverview}
            loading={loading}
            height={height - 120}
            customConfig={{ color: '#1890ff' }}
          />
        </div>
      </Card>
    );
  }
  
  // Full visualization panel
  return (
    <Card 
      title="Activity Analytics" 
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
            size="small"
          />
          <Button 
            icon={<FullscreenOutlined />} 
            size="small"
            onClick={() => window.open('/analytics', '_blank')}
          >
            Full Analytics
          </Button>
        </Space>
      }
      style={{ height }}
    >
      {showControls && (
        <>
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <Space>
                <span style={{ fontSize: '12px', color: '#666' }}>View:</span>
                      <Select
                        value={config.preset}
                        onChange={handlePresetChange}
                        style={{ width: 160 }}
                        disabled={loading}
                      >
                        {CHART_PRESETS.map((preset: { id: string; title: string }) => (
                          <Option key={preset.id} value={preset.id}>
                            {preset.title}
                          </Option>
                        ))}
                      </Select>
              </Space>
            </Col>
            <Col span={12}>
              <DateRangeSelector
                selectedRange={config.dateRange}
                customDateRange={config.customDateRange}
                onRangeChange={handleDateRangeChange}
                disabled={loading}
              />
            </Col>
          </Row>
          
          {stats && (
            <Row gutter={16} style={{ marginBottom: '16px', fontSize: '12px' }}>
              <Col span={6}>
                <strong>Total Time:</strong> {Math.floor(stats.totalTime / 60)}m {stats.totalTime % 60}s
              </Col>
              <Col span={6}>
                <strong>Sessions:</strong> {stats.totalSessions}
              </Col>
              <Col span={6}>
                <strong>Unique Sites:</strong> {stats.uniqueSites}
              </Col>
              <Col span={6}>
                <strong>Productivity:</strong> {stats.productivityScore}%
              </Col>
            </Row>
          )}
          
          <Divider style={{ margin: '8px 0' }} />
        </>
      )}
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        size="small"
        tabPosition="top"
      >
        {CHART_PRESETS.find((p: { id: string }) => p.id === config.preset)?.charts.map((chartId: string) => (
          <TabPane 
            tab={
              <span>
                {getChartIcon(chartId)}
                {CHART_TYPES[chartId]?.title}
              </span>
            } 
            key={`${config.preset}-${chartId}`}
          >
            <div style={{ height: height - 180 }}>
              <ChartRenderer
                chartId={chartId}
                data={chartData[chartId as keyof typeof chartData] || []}
                loading={loading}
                height={height - 180}
              />
            </div>
          </TabPane>
        ))}
      </Tabs>
    </Card>
  );
};

export default VisualizationPanel;