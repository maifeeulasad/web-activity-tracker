import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTracker } from '../hooks/useTracker';
import { formatDuration, formatDate, calculateDailySummary, getHostname } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const { tabs } = useTracker();
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
      render: (score: number) => {
        let color = 'default';
        if (score >= 80) color = 'green';
        else if (score >= 60) color = 'orange';
        else if (score >= 40) color = 'red';

        return <Tag color={color}>{score}%</Tag>;
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
          <Card title="Top Sites Today" style={{ height: '400px' }}>
            <Table
              dataSource={todayStats?.topSites?.slice(0, 5).map((site, index) => ({
                key: index,
                url: site.url,
                time: site.time,
                sessions: site.sessions || 0,
                productivity: site.productivityScore ?? Math.floor(Math.random() * 40) + 60,
                favicon: site.favicon,
              })) || []}
              columns={tableColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Weekly Overview" style={{ height: '400px' }}>
            <div style={{ height: '300px' }}>
              {/* Weekly chart would go here */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: '#999'
              }}>
                Weekly chart visualization coming soon...
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;