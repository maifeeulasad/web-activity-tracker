// Date range selector component
import React from 'react';
import { DatePicker, Select, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { DATE_RANGES, DateRange } from '../utils/visualizationConfig';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DateRangeSelectorProps {
  selectedRange: string;
  customDateRange?: [Date, Date] | null;
  onRangeChange: (range: string, customRange?: [Date, Date]) => void;
  disabled?: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedRange,
  customDateRange,
  onRangeChange,
  disabled = false
}) => {
  const handlePresetChange = (value: string) => {
    if (value === 'custom') {
      // Keep current custom range or set to last 7 days
      const customRange = customDateRange || [
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      ];
      onRangeChange(value, customRange);
    } else {
      const preset = DATE_RANGES.find((range: DateRange) => range.value === value);
      if (preset) {
        const [start, end] = preset.getDates();
        onRangeChange(value, [start, end]);
      }
    }
  };
  
  const handleCustomRangeChange = (dates: Array<{ toDate: () => Date } | null> | null) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      onRangeChange('custom', [dates[0].toDate(), dates[1].toDate()]);
    }
  };
  
  const getRangeLabel = () => {
    if (selectedRange === 'custom' && customDateRange) {
      return `${format(customDateRange[0], 'MMM dd')} - ${format(customDateRange[1], 'MMM dd')}`;
    }
    
    const preset = DATE_RANGES.find((range: DateRange) => range.value === selectedRange);
    return preset?.label || 'Select Range';
  };
  
  return (
    <Space size="middle" style={{ marginBottom: '16px' }}>
      <CalendarOutlined />
      <Select
        value={selectedRange}
        onChange={handlePresetChange}
        style={{ width: 140 }}
        disabled={disabled}
      >
        {DATE_RANGES.map((range: DateRange) => (
          <Option key={range.value} value={range.value}>
            {range.label}
          </Option>
        ))}
        <Option value="custom">Custom Range</Option>
      </Select>
      
      {selectedRange === 'custom' && (
        <RangePicker
          onChange={handleCustomRangeChange}
          disabled={disabled}
          format="MMM DD, YYYY"
        />
      )}
      
      <span style={{ fontSize: '12px', color: '#666' }}>
        Current: {getRangeLabel()}
      </span>
    </Space>
  );
};

export default DateRangeSelector;