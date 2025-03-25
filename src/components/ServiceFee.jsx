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

    // 构建现金流数组：首期为实际到手金额（贷款金额-服务费），最后一期为还款金额（贷款金额）
    const cashflows = [-(amount - fee)];
    for (let i = 0; i < days - 1; i++) {
      cashflows.push(0);
    }
    cashflows.push(amount);

    // 计算单利年化利率
    const actualAmount = amount - fee; // 实际到手金额
    const dailyRate = (fee / actualAmount / days) * 100; // 日利率
    const monthlyRate = dailyRate * 30; // 月利率
    const annualRate = dailyRate * 365; // 年化利率

    setResults({
      dailyRate: dailyRate.toFixed(4),
      monthlyRate: monthlyRate.toFixed(4),
      annualRate: annualRate.toFixed(2)
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
        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
          例子：贷款1000，服务费200，5天还款
        </Text>
        <Form.Item
          label="贷款金额 "
          name="amount"
          rules={[{ required: true, message: '请输入提现金额' }]}
        >
          <Input type="number" placeholder="例如: 10000" />
        </Form.Item>

        <Form.Item
          label="服务费 (贷款总额-下款金额)"
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
            <Text>日利率: {results.dailyRate}%</Text>
          </div>
          <div className="form-row">
            <Text>月利率: {results.monthlyRate}%</Text>
          </div>
          <div className="form-row">
            <Text>年化利率: {results.annualRate}%</Text>
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