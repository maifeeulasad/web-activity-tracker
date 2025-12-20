import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Popconfirm,
  Row,
  Col,
  Progress,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BlockOutlined
} from '@ant-design/icons';
import { useSiteLimits } from '../hooks/useTracker';
import { SiteLimit } from '../types';
import { sanitizeUrl, getHostname, formatDuration } from '../utils/helpers';

const SiteLimits: React.FC = () => {
  const { siteLimits, addSiteLimit, updateSiteLimit, deleteSiteLimit } = useSiteLimits();
  const [form] = Form.useForm();
  const [editingLimit, setEditingLimit] = useState<SiteLimit | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const showAddModal = () => {
    setEditingLimit(null);
    setModalTitle('Add Site Limit');
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (limit: SiteLimit) => {
    setEditingLimit(limit);
    setModalTitle('Edit Site Limit');
    form.setFieldsValue({
      url: limit.url,
      dailyLimit: limit.dailyLimit,
      enabled: limit.enabled,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: { url: string; dailyLimit: number; enabled: boolean }) => {
    const sanitizedUrl = sanitizeUrl(values.url);
    if (!sanitizedUrl) {
      return;
    }

    const limitData: SiteLimit = {
      url: sanitizedUrl,
      dailyLimit: values.dailyLimit,
      enabled: values.enabled,
      blocked: editingLimit?.blocked || false,
    };

    if (editingLimit) {
      await updateSiteLimit(editingLimit.url, limitData);
    } else {
      await addSiteLimit(limitData);
    }

    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (url: string) => {
    await deleteSiteLimit(url);
  };

  const toggleLimit = async (limit: SiteLimit) => {
    await updateSiteLimit(limit.url, { enabled: !limit.enabled });
  };

  const getLimitStatus = (limit: SiteLimit) => {
    if (!limit.enabled) return { color: 'default', text: 'Disabled' };
    if (limit.blocked) return { color: 'red', text: 'Blocked' };
    return { color: 'green', text: 'Active' };
  };

  const getUsagePercentage = (limit: SiteLimit) => {
    // This would be calculated based on actual usage data
    // For now, we'll simulate some usage
    const mockUsage = Math.floor(Math.random() * limit.dailyLimit * 60); // Convert to seconds
    return Math.min((mockUsage / (limit.dailyLimit * 60)) * 100, 100);
  };

  const columns = [
    {
      title: 'Website',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{getHostname(url)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{url}</div>
        </div>
      ),
    },
    {
      title: 'Daily Limit',
      dataIndex: 'dailyLimit',
      key: 'dailyLimit',
      render: (limit: number) => `${limit} minutes`,
    },
    {
      title: 'Usage Today',
      key: 'usage',
      render: (record: SiteLimit) => {
        const percentage = getUsagePercentage(record);
        const status = percentage >= 100 ? 'exception' : percentage >= 80 ? 'active' : 'normal';

        return (
          <div>
            <Progress
              percent={percentage}
              size="small"
              status={status}
              format={() => `${Math.round(percentage)}%`}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {formatDuration(Math.floor(percentage * record.dailyLimit * 60 / 100))} used
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: SiteLimit) => {
        const status = getLimitStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: SiteLimit) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Switch
            size="small"
            checked={record.enabled}
            onChange={() => toggleLimit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this limit?"
            onConfirm={() => handleDelete(record.url)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Site Limits</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Alert
            message="Site Limits Help You Stay Productive"
            description="Set daily time limits for distracting websites. When you reach the limit, the site will be blocked for the rest of the day."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        </Col>
        <Col xs={24} lg={8}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            block
          >
            Add Site Limit
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={siteLimits}
          columns={columns}
          rowKey="url"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} limits`,
          }}
          locale={{
            emptyText: 'No site limits configured. Add your first limit to get started!',
          }}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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
              prefix={<BlockOutlined />}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Daily Limit (minutes)"
                name="dailyLimit"
                rules={[{ required: true, message: 'Please enter a daily limit' }]}
              >
                <InputNumber
                  min={1}
                  max={1440}
                  placeholder="60"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Enable Limit"
                name="enabled"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingLimit ? 'Update' : 'Add'} Limit
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SiteLimits;