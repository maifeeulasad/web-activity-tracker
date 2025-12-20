import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Select, Statistic, Table, Tabs } from 'antd';
import { Line, Pie, Area } from '@ant-design/plots';
import { CalendarOutlined, ClockCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTracker } from '../hooks/useTracker';
import {
  formatDuration,
  formatDate,
  calculateDailySummary,
  calculateHourlyData,
  getHostname,
} from '../utils/helpers';
import { subDays, eachDayOfInterval } from 'date-fns';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Analytics: React.FC = () => {
  const { tabs, timeIntervals } = useTracker();
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    subDays(new Date(), 7),
    new Date(),
  ]);
  const [selectedMetric, setSelectedMetric] = useState('time');

  // Prepare chart data
  const prepareDailyData = () => {
    const [start, end] = dateRange;
    const dailyData: any[] = [];

    const days = eachDayOfInterval({ start, end });
    days.forEach((d) => {
      const dateStr = formatDate(d);
      const summary = calculateDailySummary(tabs, dateStr);

      dailyData.push({
        date: dateStr,
        totalTime: summary.totalTime,
        siteCount: summary.siteCount,
        mostVisited: summary.mostVisitedSite,
      });
    });

    return dailyData;
  };

  const prepareHourlyData = () => {
    const hourlyData = calculateHourlyData(timeIntervals, formatDate(new Date()));
    return hourlyData.map(item => ({
      hour: `${item.hour}:00`,
      time: item.time,
    }));
  };

  const prepareTopSitesData = () => {
    const siteStats = new Map();

    tabs.forEach(tab => {
      const hostname = getHostname(tab.url);
      const totalTime = tab.days.reduce((sum, day) => sum + day.summary, 0);

      if (siteStats.has(hostname)) {
        siteStats.set(hostname, siteStats.get(hostname) + totalTime);
      } else {
        siteStats.set(hostname, totalTime);
      }
    });

    return Array.from(siteStats.entries())
      .map(([site, time]) => ({ site, time, count: tabs.filter(t => getHostname(t.url) === site).length }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);
  };

  const dailyData = prepareDailyData();
  const hourlyData = prepareHourlyData();
  const topSitesData = prepareTopSitesData();

  const totalTimeTracked = tabs.reduce((sum, tab) => sum + tab.summaryTime, 0);
  const averageDailyTime = dailyData.length > 0
    ? dailyData.reduce((sum, day) => sum + day.totalTime, 0) / dailyData.length
    : 0;

  const tableColumns = [
    {
      title: 'Website',
      dataIndex: 'site',
      key: 'site',
    },
    {
      title: 'Total Time',
      dataIndex: 'time',
      key: 'time',
      render: (time: number) => formatDuration(time),
    },
    {
      title: 'Visits',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Avg. Session',
      key: 'avgSession',
      render: (record: any) => formatDuration(Math.floor(record.time / record.count)),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Analytics</h2>

      {/* Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <RangePicker
              onChange={(_dates, dateStrings) => dateStrings && dateStrings[0] && dateStrings[1] && setDateRange([new Date(dateStrings[0]), new Date(dateStrings[1])])}
              allowClear={false}
            />
          </Col>
          <Col>
            <Select
              value={selectedMetric}
              onChange={setSelectedMetric}
              style={{ width: 120 }}
              options={[
                { label: 'Time', value: 'time' },
                { label: 'Visits', value: 'visits' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Time Tracked"
              value={totalTimeTracked}
              formatter={(value) => formatDuration(Number(value))}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Average Daily Time"
              value={averageDailyTime}
              formatter={(value) => formatDuration(Number(value))}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Unique Sites"
              value={tabs.length}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Tabs defaultActiveKey="daily">
        <TabPane tab="Daily Trends" key="daily">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Daily Activity" style={{ height: '400px' }}>
                <Line
                  data={dailyData}
                  xField="date"
                  yField={selectedMetric === 'time' ? 'totalTime' : 'siteCount'}
                  smooth
                  animation={{
                    appear: {
                      animation: 'path-in',
                      duration: 1000,
                    },
                  }}
                  xAxis={{
                    label: {
                      autoHide: true,
                      autoRotate: false,
                    },
                  }}
                  yAxis={{
                    label: {
                      formatter: (v: any) => selectedMetric === 'time' ? formatDuration(Number(v)) : v,
                    },
                  }}
                  height={300}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Top Sites" style={{ height: '400px' }}>
                <Pie
                  data={topSitesData.slice(0, 5).map(item => ({
                    type: item.site,
                    value: item.time,
                  }))}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                  label={{
                    type: 'outer',
                    content: '{name} {percentage}',
                  }}
                  height={300}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Hourly Patterns" key="hourly">
          <Card title="Today's Hourly Activity" style={{ height: '400px' }}>
            <Area
              data={hourlyData}
              xField="hour"
              yField="time"
              height={300}
            />
          </Card>
        </TabPane>

        <TabPane tab="Site Breakdown" key="sites">
          <Card title="Detailed Site Statistics">
            <Table
              dataSource={topSitesData}
              columns={tableColumns}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Analytics;