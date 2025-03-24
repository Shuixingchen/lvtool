import React, { useState } from 'react';
import { Form, Input, Radio, Card, Typography, Button } from 'antd';

const { Text } = Typography;

const DailyInterest = () => {
  const [form] = Form.useForm();
  const [results, setResults] = useState(null);
  const [interestType, setInterestType] = useState('daily');// daily日利率，月利率
  const [calculationType, setCalculationType] = useState('compound');// compound复利，simple单利
  const [inputMode, setInputMode] = useState('rate'); // rate利率输入，amount金额输入

  const calculateAnnualRate = (values) => {
    let rate, annualRate, dailyRate, monthlyRate;

    if (inputMode === 'amount') {
      // 通过金额计算利率
      const principal = parseFloat(values.principal);
      const dailyInterest = parseFloat(values.dailyInterest);
      dailyRate = (dailyInterest / principal) * 100; // 计算日利率

      if (calculationType === 'compound') {
        // 复利年化：(1 + 日利率/100)^365 - 1
        annualRate = (Math.pow(1 + dailyRate/100, 365) - 1) * 100;
        // 月利率：(1 + 日利率/100)^30 - 1
        monthlyRate = (Math.pow(1 + dailyRate/100, 30) - 1) * 100;
      } else {
        // 单利年化：日利率 * 365
        annualRate = dailyRate * 365;
        // 月利率：日利率 * 30
        monthlyRate = dailyRate * 30;
      }
    } else {
      rate = parseFloat(values.rate) / 100;

      if (interestType === 'daily') {
        dailyRate = rate * 100;
        if (calculationType === 'compound') {
          // 复利年化：(1 + 日利率/100)^365 - 1
          annualRate = (Math.pow(1 + rate, 365) - 1) * 100;
          // 月利率：(1 + 日利率/100)^30 - 1
          monthlyRate = (Math.pow(1 + rate, 30) - 1) * 100;
        } else {
          // 单利年化：日利率 * 365
          annualRate = dailyRate * 365;
          // 月利率：日利率 * 30
          monthlyRate = dailyRate * 30;
        }
      } else {
        monthlyRate = rate * 100;
        if (calculationType === 'compound') {
          // 复利年化：(1 + 月利率/100)^12 - 1
          annualRate = (Math.pow(1 + rate, 12) - 1) * 100;
          // 日利率：(1 + 月利率/100)^(1/30) - 1
          dailyRate = (Math.pow(1 + rate, 1/30) - 1) * 100;
        } else {
          // 单利年化：月利率 * 12
          annualRate = monthlyRate * 12;
          // 日利率：月利率 / 30
          dailyRate = monthlyRate / 30;
        }
      }
    }

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
    if ((inputMode === 'rate' && values.rate) || 
        (inputMode === 'amount' && values.principal && values.dailyInterest)) {
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
        <Form.Item label="输入方式">
          <Radio.Group
            value={inputMode}
            onChange={(e) => {
              setInputMode(e.target.value);
              form.resetFields();
              setResults(null);
              setCalculationType('compound');
            }}
          >
            <Radio.Button value="rate">利率输入</Radio.Button>
            <Radio.Button value="amount">金额输入</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Text type="secondary" style={{ display: 'block', marginTop: '-20px', marginBottom: '16px' }}>
          例子：{inputMode === 'rate' ? '日利率低至0.02%' : '一千元用一天只需要0.25元'}
        </Text>

        {inputMode === 'rate' ? (
          <>
            <Form.Item label="利率类型">
              <Radio.Group
                value={interestType}
                onChange={(e) => {
                  setInterestType(e.target.value);
                  form.resetFields(['rate']);
                  setResults(null);
                  setCalculationType('compound');
                }}
              >
                <Radio.Button value="daily">日利率</Radio.Button>
                <Radio.Button value="monthly">月利率</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label={interestType === 'daily' ? '日利率 (%)' : '月利率 (%)'}
              name="rate"
              rules={[{ required: true, message: '请输入利率' }]}
            >
              <Input
                placeholder={interestType === 'daily' ? '例如: 0.02' : '例如: 0.5'}
                type="number"
                step="0.01"
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="本金 (元)"
              name="principal"
              rules={[{ required: true, message: '请输入本金金额' }]}
            >
              <Input
                placeholder="例如: 1000"
                type="number"
                step="0.01"
              />
            </Form.Item>
            <Form.Item
              label="每日利息 (元)"
              name="dailyInterest"
              rules={[{ required: true, message: '请输入每日利息金额' }]}
            >
              <Input
                placeholder="例如: 0.25"
                type="number"
                step="0.01"
              />
            </Form.Item>
          </>
        )}

        <Form.Item label="计算方式">
          <Radio.Group
            value={calculationType}
            onChange={(e) => {
              setCalculationType(e.target.value);
              if (inputMode === 'rate') {
                form.resetFields(['rate']);
              }
              setResults(null);
            }}
          >
            <Radio.Button value="compound">复利</Radio.Button>
            <Radio.Button value="simple">单利</Radio.Button>
          </Radio.Group>
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

export default DailyInterest;