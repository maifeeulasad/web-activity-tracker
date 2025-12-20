import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Row, Col, Statistic, List, Tag, Space, Alert } from 'antd';
import { PlayCircleOutlined, StopOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTracker } from '../hooks/useTracker';
import { formatDuration, formatTime, getHostname, sanitizeUrl } from '../utils/helpers';

const TimeTracker: React.FC = () => {
  const {
    tabs,
    currentTab,
    isTracking,
    startTracking,
    stopTracking,
    deleteTab
  } = useTracker();

  const [form] = Form.useForm();
  const [currentTime, setCurrentTime] = useState(0);

  // Timer effect for current tracking session
  useEffect(() => {
    let interval: number;

    if (isTracking && currentTab) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      setCurrentTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, currentTab]);

  const handleStartTracking = async (values: { url: string; title?: string }) => {
    const sanitizedUrl = sanitizeUrl(values.url);
    if (!sanitizedUrl) {
      return;
    }

    await startTracking(sanitizedUrl, values.title || getHostname(sanitizedUrl));
    form.resetFields();
  };

  const handleStopTracking = async () => {
    await stopTracking();
  };

  const handleDeleteTab = async (url: string) => {
    await deleteTab(url);
  };

  const recentTabs = tabs
    .sort((a, b) => b.summaryTime - a.summaryTime)
    .slice(0, 10);

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Time Tracker</h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Start New Tracking Session">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleStartTracking}
            >
              <Form.Item
                label="Website URL"
                name="url"
                rules={[
                  { required: true, message: 'Please enter a website URL' },
                  {
                    validator: (_, value) => {
                      if (value && !sanitizeUrl(value)) {
                        return Promise.reject('Please enter a valid URL');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input
                  placeholder="https://example.com"
                  size="large"
                  prefix={<PlayCircleOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Title (Optional)"
                name="title"
              >
                <Input
                  placeholder="Custom title for this session"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<PlusOutlined />}
                  disabled={isTracking}
                  block
                >
                  Start Tracking
                </Button>
              </Form.Item>
            </Form>

            {isTracking && currentTab && (
              <Alert
                message="Currently Tracking"
                description={
                  <div>
                    <div><strong>URL:</strong> {currentTab.url}</div>
                    <div><strong>Time:</strong> {formatTime(currentTime)}</div>
                  </div>
                }
                type="info"
                showIcon
                action={
                  <Button
                    size="small"
                    danger
                    icon={<StopOutlined />}
                    onClick={handleStopTracking}
                  >
                    Stop
                  </Button>
                }
                style={{ marginTop: '16px' }}
              />
            )}
          </Card>

          {/* Current Session Stats */}
          {isTracking && currentTab && (
            <Card title="Session Statistics" style={{ marginTop: '16px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Session Time"
                    value={currentTime}
                    formatter={(value) => formatTime(Number(value))}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Visits"
                    value={currentTab.counter}
                  />
                </Col>
              </Row>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Recent Activity"
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            }
          >
            <List
              dataSource={recentTabs}
              renderItem={(tab) => (
                <List.Item key={tab.url}
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTab(tab.url)}
                    >
                      Delete
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      tab.favicon && (
                        <img
                          src={tab.favicon}
                          alt=""
                          style={{ width: 24, height: 24 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )
                    }
                    title={getHostname(tab.url)}
                    description={
                      <Space direction="vertical" size="small">
                        <div>
                          <Tag color="blue">{formatDuration(tab.summaryTime)}</Tag>
                          <Tag>{tab.counter} visits</Tag>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {tab.url}
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            {recentTabs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No tracking data yet. Start your first session!
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TimeTracker;