import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getTrainignsInInterval, Training } from '../../utils/training';
import { useTheme } from '../../contexts/ThemeContext';

interface TrainingCalendarProps {
  year: number;
  month: number; // 0-based: 0 = January, 11 = December,
  selectDay: (trainings: Training[], date: Date) => void
}

const generateMonthGrid = (year: number, month: number, trainings: Training[]): (Training[]|null)[][] => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const daysInMonth = endDate.getDate();

    const grid: (Training[]|null)[][] = Array.from({ length: 7 }, () => [null, null, null, null, null]); // 7 rows for days Mon-Sun
    trainings.sort((a, b) => a.time.getTime() - b.time.getTime());
    let idx = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = (date.getDay() + 6) % 7; // Make Monday = 0, Sunday = 6
        const weekIndex = Math.floor((day + (startDate.getDay() + 6) % 7 - 1) / 7);
        if (grid[dayOfWeek][weekIndex] == null) {
            grid[dayOfWeek][weekIndex] = [];
        }

        while (idx < trainings.length && (trainings[idx].time.getFullYear() < date.getFullYear() && trainings[idx].time.getDate() < date.getDate())) {
            idx++;
        }
        while (idx < trainings.length && trainings[idx].time.getFullYear() == date.getFullYear() && trainings[idx].time.getDate() == date.getDate()) {
            grid[dayOfWeek][weekIndex]?.push(trainings[idx]);
            idx++;
        }
    }
    return grid;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

async function getTrainings(year: number, month: number): Promise<Training[]> {
  let start = new Date(year, month, 1);
  let end = new Date(year, month, 1);
  end.setMonth(end.getMonth() + 1);
  
  return getTrainignsInInterval(start, end);
}

const TrainingMonthGrid: React.FC<TrainingCalendarProps> = ({ year, month, selectDay }) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const grid = generateMonthGrid(year, month, trainings);
  const { theme } = useTheme();

  useEffect(() => {
    async function init() {
      setTrainings(await getTrainings(year, month));
    }
    init();
  });

  function getDate(rowIdx: number, colIdx: number) {
    let cnt = 0;
    for (const row of grid) {
      for (const col of row) {
        if (col == null)
          cnt++;
        else break;
      }
    }
    let day = Math.max(colIdx * 7 + rowIdx - cnt + 1, 0);
    return new Date(year, month, day);
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {grid.map((weekdayRow, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {weekdayRow.map((_trainings, colIdx) => {
              return (
                <TouchableOpacity
                  key={colIdx}
                  onPress={() => selectDay(_trainings || [], getDate(rowIdx, colIdx))}
                  style={[
                    styles.cell,
                    {backgroundColor:  _trainings == null ? 'transparent' : _trainings.length ? theme.inputBackground : theme.buttonBackground},
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <Text style={[styles.monthTitle, {color: theme.text}]}>{monthNames[month]} {year}</Text>
    </View>
  );
};

const CELL_SIZE = 22;
const CELL_MARGIN = 2;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: CELL_MARGIN,
    borderRadius: 4,
  },
  filledCell: {
    backgroundColor: '#4CAF50',
  },
  emptyCell: {
    backgroundColor: '#EEE',
  },
  hiddenCell: {
    backgroundColor: 'transparent',
  },
});

export default TrainingMonthGrid;
