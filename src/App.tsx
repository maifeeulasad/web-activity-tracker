import React, { useState } from 'react';
import { Layout, Menu, ConfigProvider, theme } from 'antd';
import {
  DashboardOutlined,
  BarChartOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  BlockOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import TimeTracker from './pages/TimeTracker';
import SiteLimits from './pages/SiteLimits';
import { useSettings } from './hooks/useTracker';
import './App.css';

const { Header, Content, Sider } = Layout;

type MenuKey = 'dashboard' | 'tracker' | 'analytics' | 'limits' | 'settings';

const App: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>('dashboard');
  const { settings } = useSettings();

  // On initial load, check the hash and show the corresponding view (useful when opening index.html#analytics)
  React.useEffect(() => {
    try {
      const h = window.location.hash.replace('#', '');
      if (h === 'analytics') setSelectedMenu('analytics');
      else if (h === 'tracker') setSelectedMenu('tracker');
      else if (h === 'limits') setSelectedMenu('limits');
      else if (h === 'settings') setSelectedMenu('settings');
      else if (h === 'dashboard') setSelectedMenu('dashboard');
    } catch (e) {
      // ignore
    }
  }, []);

  const menuItems = [
    {
      key: 'dashboard' as MenuKey,
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'tracker' as MenuKey,
      icon: <ClockCircleOutlined />,
      label: 'Time Tracker',
    },
    {
      key: 'analytics' as MenuKey,
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: 'limits' as MenuKey,
      icon: <BlockOutlined />,
      label: 'Site Limits',
    },
    {
      key: 'settings' as MenuKey,
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'tracker':
        return <TimeTracker />;
      case 'analytics':
        return <Analytics />;
      case 'limits':
        return <SiteLimits />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: settings.darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div className="logo">
            <ClockCircleOutlined style={{ fontSize: '24px', color: '#fff', marginRight: '8px' }} />
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
              Web Tracker
            </span>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={({ key }) => setSelectedMenu(key as MenuKey)}
          />
        </Sider>
        <Layout style={{ marginLeft: 200 }}>
          <Header
            style={{
              padding: '0 24px',
              background: settings.darkMode ? '#141414' : '#fff',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            }}
          >
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'normal' }}>
              Web Activity Tracker
            </h1>
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: settings.darkMode ? '#1f1f1f' : '#fff',
              borderRadius: '8px',
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;