import React, { useState } from 'react';
import { Form, Input, Card, Typography, Button } from 'antd';

const { Text } = Typography;

const ServiceFee = () => {
  const [form] = Form.useForm();
  const [results, setResults] = useState(null);

  const calculateAnnualRate = (values) => {
    const amount = parseFloat(values.amount);
    const fee = parseFloat(values.fee);
    const days = parseFloat(values.days);

    // 计算服务费率
    const feeRate = fee / amount;
    
    // 计算年化利率（单利）
    const simpleAnnualRate = (feeRate * 365 / days) * 100;
    
    // 计算年化利率（复利）
    const compoundAnnualRate = (Math.pow(1 + feeRate, 365 / days) - 1) * 100;

    setResults({
      feeRate: (feeRate * 100).toFixed(2),
      simpleAnnualRate: simpleAnnualRate.toFixed(2),
      compoundAnnualRate: compoundAnnualRate.toFixed(2),
      dailyFee: (fee / days).toFixed(2)
    });
  };

  const handleValuesChange = (changedValues, allValues) => {
    // 移除实时计算逻辑
  };

  const handleCalculate = () => {
    const values = form.getFieldsValue();
    if (values.amount && values.fee && values.days) {
      calculateAnnualRate(values);
    }
  };

  return (
    <div>
      <Form
        form={form}
        onValuesChange={handleValuesChange}
        layout="vertical"
      >
        <Form.Item
          label="提现金额 (元)"
          name="amount"
          rules={[{ required: true, message: '请输入提现金额' }]}
        >
          <Input type="number" placeholder="例如: 10000" />
        </Form.Item>

        <Form.Item
          label="服务费 (元)"
          name="fee"
          rules={[{ required: true, message: '请输入服务费' }]}
        >
          <Input type="number" placeholder="例如: 500" />
        </Form.Item>

        <Form.Item
          label="借款天数"
          name="days"
          rules={[{ required: true, message: '请输入借款天数' }]}
        >
          <Input type="number" placeholder="例如: 5" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleCalculate}>计算</Button>
        </Form.Item>
      </Form>

      {results && (
        <Card title="计算结果" className="result-card">
          <div className="form-row">
            <Text>服务费率: {results.feeRate}%</Text>
          </div>
          <div className="form-row">
            <Text>日均服务费: {results.dailyFee} 元</Text>
          </div>
          <div className="form-row">
            <Text>年化利率（单利）: {results.simpleAnnualRate}%</Text>
          </div>
          <div className="form-row">
            <Text>年化利率（复利）: {results.compoundAnnualRate}%</Text>
          </div>
        </Card>
      )}
      <div style={{ marginTop: '16px' }}>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          根据《最高人民法院关于审理民间借贷案件适用法律若干问题的规定》（2020年修正），民间借贷利率的司法保护上限为合同成立时一年期贷款市场报价利率（LPR）的四倍。以2025年3月20日公布的1年期LPR（3.10%）计算，当前法定利率上限为12.4%
        </Text>
      </div>
    </div>
  );
};

export default ServiceFee;