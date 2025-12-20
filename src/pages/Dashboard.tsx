import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTracker } from '../hooks/useTracker';
import { useResponsiveProps } from '../hooks/useResponsive';
import { formatDuration, formatDate, calculateDailySummary, getHostname } from '../utils/helpers';
import { calculateWebsiteProductivity, getProductivityRecommendation } from '../utils/productivityData';
import VisualizationPanel from '../components/VisualizationPanel';

const Dashboard: React.FC = () => {
  const { tabs, timeIntervals } = useTracker();
  const [loading, setLoading] = useState(true);
  const responsive = useResponsiveProps();
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
      width: responsive.isMobile ? 120 : 200,
      render: (url: string, record: { favicon?: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          {record.favicon && (
            <img
              src={record.favicon}
              alt=""
              style={{ 
                width: responsive.isMobile ? 12 : 16, 
                height: responsive.isMobile ? 12 : 16, 
                marginRight: responsive.isMobile ? 4 : 8,
                flexShrink: 0
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span style={{ 
            fontSize: responsive.fonts.small,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {getHostname(url)}
          </span>
        </div>
      ),
    },
    {
      title: responsive.isMobile ? 'Time' : 'Time Spent',
      dataIndex: 'time',
      key: 'time',
      width: responsive.isMobile ? 60 : 100,
      render: (time: number) => (
        <span style={{ fontSize: responsive.fonts.small }}>
          {formatDuration(time)}
        </span>
      ),
    },
    {
      title: responsive.isMobile ? 'Ses' : 'Sessions',
      dataIndex: 'sessions',
      key: 'sessions',
      width: responsive.isMobile ? 45 : 80,
      render: (sessions: number) => (
        <span style={{ fontSize: responsive.fonts.small }}>
          {sessions}
        </span>
      ),
    },
    {
      title: responsive.isMobile ? 'Prod' : 'Productivity',
      dataIndex: 'productivity',
      key: 'productivity',
      width: responsive.isMobile ? 70 : 120,
      render: (score: number, record: TopSiteRow) => {
        const recommendation = getProductivityRecommendation(score);

        return (
          <div>
            <Tag 
              color={record.productivityColor || recommendation.color}
              style={{ 
                marginBottom: responsive.isMobile ? '2px' : '4px',
                fontSize: responsive.isMobile ? '9px' : '11px',
                padding: responsive.isMobile ? '0 4px' : '2px 6px'
              }}
            >
              {score}%
            </Tag>
            {!responsive.isMobile && (
              <div style={{ 
                fontSize: '11px', 
                color: '#666',
                fontWeight: record.productivityLevel === 'High' ? 'bold' : 'normal'
              }}>
                {record.productivityLevel}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: responsive.isMobile ? '200px' : '400px' 
      }}>
        <Spin size={responsive.isMobile ? "small" : "large"} />
      </div>
    );
  }

  return (
    <div>
      {/* Hide title in mobile/popup mode for more space */}
      {!responsive.isMobile && <h2 style={{ marginBottom: responsive.spacing.marginBottom }}>Dashboard</h2>}

      {/* Summary Cards - Responsive */}
      <Row 
        gutter={[responsive.spacing.gutterX, responsive.spacing.gutterY]} 
        style={{ marginBottom: responsive.spacing.marginBottom }}
      >
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card 
            {...responsive.card}
            style={{ 
              height: '100%',
              minHeight: responsive.card.minHeight
            }}
          >
            <Statistic
              title={<span style={{ fontSize: responsive.fonts.small }}>{responsive.isMobile ? 'Time' : "Today's Total Time"}</span>}
              value={todayStats?.totalTime || 0}
              formatter={(value) => formatDuration(Number(value))}
              prefix={<ClockCircleOutlined style={{ fontSize: responsive.fonts.icon }} />}
              suffix={getComparisonIcon(todayStats?.totalTime || 0, yesterdayStats?.totalTime || 0)}
              valueStyle={{ 
                fontSize: responsive.fonts.body,
                color: '#3f8600'
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card 
            {...responsive.card}
            style={{ 
              height: '100%',
              minHeight: responsive.card.minHeight
            }}
          >
            <Statistic
              title={<span style={{ fontSize: responsive.fonts.small }}>{responsive.isMobile ? 'Sites' : 'Sites Visited'}</span>}
              value={todayStats?.siteCount || 0}
              prefix={<GlobalOutlined style={{ fontSize: responsive.fonts.icon }} />}
              suffix={getComparisonIcon(todayStats?.siteCount || 0, yesterdayStats?.siteCount || 0)}
              valueStyle={{ 
                fontSize: responsive.fonts.body,
                color: '#1890ff'
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card 
            {...responsive.card}
            style={{ 
              height: '100%',
              minHeight: responsive.card.minHeight
            }}
          >
            <Statistic
              title={<span style={{ fontSize: responsive.fonts.small }}>{responsive.isMobile ? 'Top Site' : 'Most Visited'}</span>}
              value={getHostname(todayStats?.mostVisitedSite || 'N/A')}
              prefix={<GlobalOutlined style={{ fontSize: responsive.fonts.icon }} />}
              valueStyle={{ 
                fontSize: responsive.fonts.body,
                color: '#722ed1'
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card 
            {...responsive.card}
            style={{ 
              height: '100%',
              minHeight: responsive.card.minHeight
            }}
          >
            <Statistic
              title={<span style={{ fontSize: responsive.fonts.small }}>{responsive.isMobile ? 'Score' : 'Productivity Score'}</span>}
              value={todayStats?.productivityScore || 0}
              suffix="%"
              valueStyle={{ 
                fontSize: responsive.fonts.body,
                color: '#52c41a'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[responsive.spacing.gutterX, responsive.spacing.gutterY]}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ fontSize: responsive.fonts.title }}>{responsive.isMobile ? 'Top Sites' : 'Top Sites Today (with Productivity Scores)'}</span>} 
            bodyStyle={responsive.card.bodyStyle}
            style={{ 
              height: 'auto',
              minHeight: responsive.isMobile ? '300px' : '400px',
              marginBottom: responsive.isMobile ? '8px' : '0'
            }}
          >
            <Table
              dataSource={todayStats?.topSites?.slice(0, responsive.isMobile ? 3 : 5).map((site, index) => {
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
              scroll={{ 
                x: responsive.isMobile ? 300 : undefined,
                y: responsive.isMobile ? 200 : 250
              }}
              style={{ fontSize: responsive.fonts.small }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={<span style={{ fontSize: responsive.fonts.title }}>{responsive.isMobile ? 'Analytics' : 'Weekly Overview'}</span>} 
            bodyStyle={responsive.card.bodyStyle}
            style={{ 
              height: 'auto',
              minHeight: responsive.isMobile ? '300px' : '400px'
            }}
          >
            <VisualizationPanel
              tabs={tabs}
              timeIntervals={timeIntervals}
              height={responsive.isMobile ? 200 : 300}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;