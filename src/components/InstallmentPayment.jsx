import React, { useState } from 'react';
import { Form, Input, Radio, Card, Typography, Table, Button } from 'antd';

const { Text } = Typography;

const InstallmentPayment = () => {
  const [form] = Form.useForm();
  const [results, setResults] = useState(null);
  const [paymentType, setPaymentType] = useState('equal');// equal等额本息，interest_first先息后本
  const [monthlyPayments, setMonthlyPayments] = useState([]);

  const calculatePayments = (values) => {
    const principal = parseFloat(values.principal);
    const months = parseInt(values.months);
    let payments = [];
    let totalPayment = 0;
    let totalInterest = 0;

    if (paymentType === 'equal') {
      // 等额本息
      const monthlyPayment = parseFloat(values.monthlyPayment);
      
      // 使用二分法求解月利率
      let left = 0;
      let right = 1;
      let monthlyRate;
      
      for (let i = 0; i < 50; i++) { // 最多迭代50次
        monthlyRate = (left + right) / 2;
        const calculatedPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                                 (Math.pow(1 + monthlyRate, months) - 1);
        
        if (Math.abs(calculatedPayment - monthlyPayment) < 0.01) {
          break;
        }
        
        if (calculatedPayment > monthlyPayment) {
          right = monthlyRate;
        } else {
          left = monthlyRate;
        }
      }
      
      // 计算日利率、月利率和年化利率
      const monthlyRatePercent = monthlyRate * 100;
      const dailyRate = (Math.pow(1 + monthlyRate, 1/30) - 1) * 100;
      const annualRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;

      setResults({
        dailyRate: dailyRate.toFixed(4),
        monthlyRate: monthlyRatePercent.toFixed(4),
        annualRate: annualRate.toFixed(2)
      });
      return;
    } else {
      // 先息后本
      const monthlyPaymentValues = values.monthlyPayments || [];
      let remainingPrincipal = principal;
      
      // 计算IRR需要的现金流数组，首期为借款金额的负值
      const cashflows = [-principal];
      for (let i = 0; i < months; i++) {
        cashflows.push(parseFloat(monthlyPaymentValues[i] || 0));
      }
      
      // 使用牛顿法计算月IRR
      const calculateMonthlyIRR = (cashflows, guess = 0.1) => {
        const maxIterations = 100;
        const tolerance = 0.0000001;
        
        for (let i = 0; i < maxIterations; i++) {
          let npv = 0;
          let derivativeNPV = 0;
          
          for (let j = 0; j < cashflows.length; j++) {
            npv += cashflows[j] / Math.pow(1 + guess, j);
            if (j > 0) {
              derivativeNPV += (-j * cashflows[j]) / Math.pow(1 + guess, j + 1);
            }
          }
          
          if (Math.abs(npv) < tolerance) {
            return guess;
          }
          
          guess = guess - npv / derivativeNPV;
        }
        return null;
      };
      
      const monthlyIRR = calculateMonthlyIRR(cashflows);
      const annualRate = (Math.pow(1 + monthlyIRR, 12) - 1) * 100;
      const monthlyRate = monthlyIRR * 100;
      const dailyRate = (Math.pow(1 + monthlyIRR, 1/30) - 1) * 100;

      setResults({
        dailyRate: dailyRate.toFixed(4),
        monthlyRate: monthlyRate.toFixed(4),
        annualRate: annualRate.toFixed(2)
      });
    }
  };

  const columns = [
    { title: '期数', dataIndex: 'month', key: 'month' },
    { title: '月供(元)', dataIndex: 'payment', key: 'payment' },
    { title: '本金(元)', dataIndex: 'principal', key: 'principal' },
    { title: '利息(元)', dataIndex: 'interest', key: 'interest' },
    { title: '剩余本金(元)', dataIndex: 'remaining', key: 'remaining' }
  ];

  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.months) {
      handleMonthsChange(changedValues.months);
    }
  };

  const handleCalculate = () => {
    const values = form.getFieldsValue();
    if (values.principal && values.months && 
        (paymentType === 'equal' ? values.monthlyPayment : values.monthlyPayments?.length === parseInt(values.months))) {
      calculatePayments(values);
    }
  };

  const handleMonthsChange = (value) => {
    if (paymentType === 'interest_first' && value) {
      const months = parseInt(value);
      setMonthlyPayments(new Array(months).fill(''));
      form.setFieldsValue({ monthlyPayments: new Array(months).fill('') });
    }
  };

  return (
    <div>
      <Form
        form={form}
        onValuesChange={handleValuesChange}
        layout="vertical"
      >
        <Form.Item label="还款方式">
          <Radio.Group
            value={paymentType}
            onChange={(e) => {
              setPaymentType(e.target.value);
              form.resetFields();
              setResults(null);
            }}
          >
            <Radio.Button value="equal">等额本息</Radio.Button>
            <Radio.Button value="interest_first">先息后本</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Text type="secondary" style={{ display: 'block', marginTop: '-20px', marginBottom: '16px' }}>
          {paymentType === 'equal' ? '例子：借款1万元分12期还款，每期还款900元' : '例子：借一万，12个月还款'}
        </Text>

        <Form.Item
          label="借款金额 (元)"
          name="principal"
          rules={[{ required: true, message: '请输入借款金额' }]}
        >
          <Input type="number" placeholder="例如: 10000" />
        </Form.Item>

        <Form.Item
          label="借款期限 (月)"
          name="months"
          rules={[{ required: true, message: '请输入借款期限' }]}
        >
          <Input type="number" placeholder="例如: 12" />
        </Form.Item>

        {paymentType === 'equal' ? (
          <Form.Item
            label="每期还款金额 (元)"
            name="monthlyPayment"
            rules={[{ required: true, message: '请输入每期还款金额' }]}
          >
            <Input type="number" step="0.01" placeholder="例如: 900" />
          </Form.Item>
        ) : (
          <Form.Item
            label="每期还款金额"
            required
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {monthlyPayments.map((_, index) => (
                <Form.Item
                  key={index}
                  name={['monthlyPayments', index]}
                  rules={[{ required: true, message: `请输入第${index + 1}期还款金额` }]}
                  style={{ marginBottom: '8px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Text strong style={{ width: '80px', flexShrink: 0 }}>
                      第{index + 1}期：
                    </Text>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="输入金额"
                    />
                  </div>
                </Form.Item>
              ))}
            </div>
          </Form.Item>
        )}

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

export default InstallmentPayment;