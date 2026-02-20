import { fireEvent, render, screen } from '@testing-library/react-native';

import { SegmentedToggle } from '@/components/ui/segmented-toggle';

describe('SegmentedToggle', () => {
  it('calls onChange with the tapped option value', () => {
    const onChange = jest.fn();

    render(
      <SegmentedToggle
        options={[
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
        ]}
        value="income"
        onChange={onChange}
      />
    );

    fireEvent.press(screen.getByText('Expense'));

    expect(onChange).toHaveBeenCalledWith('expense');
  });
});
