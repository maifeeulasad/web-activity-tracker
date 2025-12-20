import React, { useState } from 'react';
import {
  Card,
  Form,
  Switch,
  InputNumber,
  Select,
  Button,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  message,
  Popconfirm
} from 'antd';
import {
  BellOutlined,
  MoonOutlined,
  GlobalOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useSettings } from '../hooks/useTracker';
import { storageManager } from '../storage/database';

const Settings: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [loading, setLoading] = useState(false);

  const handleSettingChange = async <K extends keyof typeof settings>(key: K, value: typeof settings[K] | null) => {
    try {
      // Normalize nulls from some components (e.g. InputNumber returns number | null)
      const normalized = value === null ? (typeof settings[key] === 'number' ? (settings[key] as number) : value) : value;
      await updateSetting(key, normalized as typeof settings[K]);
      message.success('Setting updated successfully');
    } catch (error) {
      message.error('Failed to update setting');
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const data = await storageManager.exportData();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `web-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success('Data exported successfully');
    } catch (error) {
      message.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);

      await storageManager.importData(data);
      message.success('Data imported successfully');

      // Refresh the page to reload all data
      window.location.reload();
    } catch (error) {
      message.error('Failed to import data. Please check the file format.');
    } finally {
      setLoading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleClearAllData = async () => {
    try {
      setLoading(true);
      await storageManager.clearAllData();
      message.success('All data cleared successfully');
      window.location.reload();
    } catch (error) {
      message.error('Failed to clear data');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      setLoading(true);
      await resetSettings();
      message.success('Settings reset successfully');
      window.location.reload();
    } catch (error) {
      message.error('Failed to reset settings');
    } finally {
      setLoading(false);
    }
  };

  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: '中文', value: 'zh' },
    { label: 'Español', value: 'es' },
    { label: 'Français', value: 'fr' },
    { label: 'Deutsch', value: 'de' },
    { label: '日本語', value: 'ja' },
    { label: 'Русский', value: 'ru' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Settings</h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="General Settings" extra={<BellOutlined />}>
            <Form layout="vertical">
              <Form.Item label="Dark Mode">
                <Space>
                  <Switch
                    checked={settings.darkMode}
                    onChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                  <span>Enable dark theme</span>
                </Space>
              </Form.Item>

              <Form.Item label="Language">
                <Select
                  value={settings.language}
                  onChange={(value) => handleSettingChange('language', value)}
                  style={{ width: '100%' }}
                  prefix={<GlobalOutlined />}
                >
                  {languageOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Notifications" style={{ marginTop: '16px' }} extra={<BellOutlined />}>
            <Form layout="vertical">
              <Form.Item label="Enable Notifications">
                <Space>
                  <Switch
                    checked={settings.notifications}
                    onChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                  <span>Receive notifications for tracking events</span>
                </Space>
              </Form.Item>

              <Form.Item label="Daily Reminder">
                <Space>
                  <Switch
                    checked={settings.dailyReminder}
                    onChange={(checked) => handleSettingChange('dailyReminder', checked)}
                  />
                  <span>Get reminded to check your daily stats</span>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Pomodoro Timer" extra={<MoonOutlined />}>
            <Form layout="vertical">
              <Form.Item label="Enable Pomodoro">
                <Space>
                  <Switch
                    checked={settings.pomodoroEnabled}
                    onChange={(checked) => handleSettingChange('pomodoroEnabled', checked)}
                  />
                  <span>Use Pomodoro technique for better focus</span>
                </Space>
              </Form.Item>

              {settings.pomodoroEnabled && (
                <>
                  <Form.Item label="Work Duration (minutes)">
                    <InputNumber
                      min={1}
                      max={60}
                      value={settings.pomodoroTime}
                      onChange={(value) => handleSettingChange('pomodoroTime', value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item label="Break Duration (minutes)">
                    <InputNumber
                      min={1}
                      max={30}
                      value={settings.breakTime}
                      onChange={(value) => handleSettingChange('breakTime', value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </>
              )}
            </Form>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Data Management" extra={<ExportOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExportData}
                loading={loading}
                block
              >
                Export Data
              </Button>

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                  id="import-file"
                />
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => document.getElementById('import-file')?.click()}
                  loading={loading}
                  block
                >
                  Import Data
                </Button>
              </div>

              <Alert
                message="Data Privacy"
                description="All your data is stored locally in your browser. No information is sent to external servers."
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Danger Zone" extra={<DeleteOutlined style={{ color: '#ff4d4f' }} />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Popconfirm
                title="Are you sure you want to reset all settings to default?"
                description="This action cannot be undone."
                onConfirm={handleResetSettings}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  icon={<ReloadOutlined />}
                  loading={loading}
                  block
                >
                  Reset Settings
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Are you sure you want to clear ALL data?"
                description="This will permanently delete all your tracking data, tabs, limits, and settings. This action cannot be undone."
                onConfirm={handleClearAllData}
                okText="Yes, Delete Everything"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={loading}
                  block
                >
                  Clear All Data
                </Button>
              </Popconfirm>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card>
        <Alert
          message="About Web Activity Tracker"
          description={
            <div>
              <p>This is a modern web application for tracking your online activity and improving productivity.</p>
              <p><strong>Features:</strong></p>
              <ul>
                <li>Track time spent on websites</li>
                <li>View detailed analytics and charts</li>
                <li>Set daily limits for distracting sites</li>
                <li>Pomodoro timer for focused work sessions</li>
                <li>Dark mode and customizable settings</li>
                <li>Export/import data for backup</li>
              </ul>
              <p><strong>Privacy:</strong> All data is stored locally in your browser using IndexedDB.</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default Settings;