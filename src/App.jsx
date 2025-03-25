import React from 'react';
import { Tabs } from 'antd';
import DailyInterest from './components/DailyInterest';
import InstallmentPayment from './components/InstallmentPayment';
import ServiceFee from './components/ServiceFee';

const App = () => {
  const items = [
    {
      key: '1',
      label: '日利率/月利率计算',
      children: <DailyInterest />,
    },
    {
      key: '2',
      label: '分期还款计算',
      children: <InstallmentPayment />,
    },
    {
      key: '3',
      label: '服务费/高炮计算',
      children: <ServiceFee />,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>贷款计算工具</h1>
      <Tabs
        defaultActiveKey="1"
        items={items}
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default App;