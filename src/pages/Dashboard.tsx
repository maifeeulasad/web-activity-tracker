import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTracker } from '../hooks/useTracker';
import { formatDuration, formatDate, calculateDailySummary, getHostname } from '../utils/helpers';
import { calculateWebsiteProductivity, getProductivityRecommendation } from '../utils/productivityData';
import VisualizationPanel from '../components/VisualizationPanel';

const Dashboard: React.FC = () => {
  const { tabs, timeIntervals } = useTracker();
  const [loading, setLoading] = useState(true);
  type DailyResult = {
    totalTime: number;
    siteCount: number;
    mostVisitedSite?: string;
    topSites?: Array<{ url: string; time: number; favicon?: string; sessions?: number; productivityScore?: number }>;
    productivityScore?: number;
  } | null;

  const [todayStats, setTodayStats] = useState<DailyResult>(null);
  const [yesterdayStats, setYesterdayStats] = useState<DailyResult>(null);

  // Row type for the Top Sites table
  type TopSiteRow = {
    key: number;
    url: string;
    hostname: string;
    time: number;
    sessions: number;
    productivity: number;
    productivityLevel?: string;
    productivityColor?: string;
    favicon?: string;
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const today = formatDate(new Date());
        const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

        const todayData = calculateDailySummary(tabs, today);
        const yesterdayData = calculateDailySummary(tabs, yesterday);

        setTodayStats(todayData);
        setYesterdayStats(yesterdayData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [tabs]);

  const getComparisonIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    if (current < previous) return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
    return null;
  };

  const tableColumns = [
    {
      title: 'Website',
      dataIndex: 'url',
      key: 'url',
      render: (url: string, record: { favicon?: string }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.favicon && (
            <img
              src={record.favicon}
              alt=""
              style={{ width: 16, height: 16, marginRight: 8 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span>{getHostname(url)}</span>
        </div>
      ),
    },
    {
      title: 'Time Spent',
      dataIndex: 'time',
      key: 'time',
      render: (time: number) => formatDuration(time),
    },
    {
      title: 'Sessions',
      dataIndex: 'sessions',
      key: 'sessions',
    },
    {
      title: 'Productivity',
      dataIndex: 'productivity',
      key: 'productivity',
      render: (score: number, record: TopSiteRow) => {
        const recommendation = getProductivityRecommendation(score);

        return (
          <div>
            <Tag 
              color={record.productivityColor || recommendation.color}
              style={{ marginBottom: '4px' }}
            >
              {score}%
            </Tag>
            <div style={{ 
              fontSize: '11px', 
              color: '#666',
              fontWeight: record.productivityLevel === 'High' ? 'bold' : 'normal'
            }}>
              {record.productivityLevel}
            </div>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Dashboard</h2>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Total Time"
              value={todayStats?.totalTime || 0}
              formatter={(value) => formatDuration(Number(value))}
              prefix={<ClockCircleOutlined />}
              suffix={getComparisonIcon(todayStats?.totalTime || 0, yesterdayStats?.totalTime || 0)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sites Visited"
              value={todayStats?.siteCount || 0}
              prefix={<GlobalOutlined />}
              suffix={getComparisonIcon(todayStats?.siteCount || 0, yesterdayStats?.siteCount || 0)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Most Visited"
              value={getHostname(todayStats?.mostVisitedSite || 'N/A')}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Productivity Score"
              value={todayStats?.productivityScore || 0}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top Sites Today (with Productivity Scores)" style={{ height: '400px' }}>
            <Table
              dataSource={todayStats?.topSites?.slice(0, 5).map((site, index) => {
                const hostname = getHostname(site.url);
                const productivityData = calculateWebsiteProductivity(hostname);
                const recommendation = getProductivityRecommendation(productivityData.score);
                
                return {
                  key: index,
                  url: site.url,
                  hostname,
                  time: site.time,
                  sessions: site.sessions || 0,
                  productivity: Math.round(productivityData.score),
                  productivityLevel: recommendation.level,
                  productivityColor: recommendation.color,
                  favicon: site.favicon,
                };
              }) || []}
              columns={tableColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Weekly Overview" style={{ height: '400px' }}>
            <VisualizationPanel
              tabs={tabs}
              timeIntervals={timeIntervals}
              height={300}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;