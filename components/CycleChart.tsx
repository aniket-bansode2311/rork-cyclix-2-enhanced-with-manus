import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

import Colors from '@/constants/colors';

const screenWidth = Dimensions.get('window').width;

interface CycleChartProps {
  cycleLengths: number[];
  periodLengths: number[];
  title: string;
}

export default function CycleChart({ cycleLengths, periodLengths, title }: CycleChartProps) {
  const renderTrendIndicator = (values: number[]) => {
    if (values.length < 2) return null;

    const recent = values.slice(0, 3);
    const previous = values.slice(3, 6);

    if (recent.length === 0 || previous.length === 0) return null;

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;

    const percentChange = ((recentAvg - previousAvg) / previousAvg) * 100;

    let TrendIcon = Minus;
    let trendColor = Colors.light.darkGray;
    let trendText = 'Stable';

    if (percentChange > 5) {
      TrendIcon = TrendingUp;
      trendColor = Colors.light.accent;
      trendText = 'Increasing';
    } else if (percentChange < -5) {
      TrendIcon = TrendingDown;
      trendColor = Colors.light.secondary;
      trendText = 'Decreasing';
    }

    return (
      <View style={styles.trendContainer}>
        <TrendIcon size={16} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>{trendText}</Text>
      </View>
    );
  };

  const renderSimpleBarChart = (data: number[], color: string, label: string) => {
    if (data.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No {label.toLowerCase()} data available</Text>
        </View>
      );
    }

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{label} Variation</Text>
          {renderTrendIndicator(data)}
        </View>
        
        <View style={styles.barChartContainer}>
          {data.slice(0, 8).reverse().map((value, index) => {
            const height = ((value - minValue) / range) * 120 + 20;
            return (
              <View key={index} style={styles.barContainer}>
                <Text style={styles.barValue}>{value}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: color,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{data.length - index}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(data.reduce((sum, val) => sum + val, 0) / data.length)}
            </Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{minValue}</Text>
            <Text style={styles.statLabel}>Shortest</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{maxValue}</Text>
            <Text style={styles.statLabel}>Longest</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLineChart = (data: number[], color: string, label: string) => {
    if (data.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No {label.toLowerCase()} data available</Text>
        </View>
      );
    }

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{label} Trend</Text>
          {renderTrendIndicator(data)}
        </View>
        
        <View style={styles.lineChartContainer}>
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>{maxValue}</Text>
            <Text style={styles.yAxisLabel}>{Math.round((maxValue + minValue) / 2)}</Text>
            <Text style={styles.yAxisLabel}>{minValue}</Text>
          </View>
          
          <View style={styles.plotArea}>
            {data.slice(0, 8).reverse().map((value, index) => {
              const y = ((maxValue - value) / range) * 120;
              const x = (index / (Math.min(data.length, 8) - 1)) * (screenWidth - 120);
              
              return (
                <View key={index}>
                  <View
                    style={[
                      styles.dataPoint,
                      {
                        left: x,
                        top: y,
                        backgroundColor: color,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.dataPointLabel,
                      {
                        left: x - 10,
                        top: y + 20,
                      },
                    ]}
                  >
                    {value}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(data.reduce((sum, val) => sum + val, 0) / data.length)}
            </Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{minValue}</Text>
            <Text style={styles.statLabel}>Min</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{maxValue}</Text>
            <Text style={styles.statLabel}>Max</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {renderLineChart(cycleLengths, Colors.light.primary, 'Cycle Length')}
      {renderSimpleBarChart(periodLengths, Colors.light.secondary, 'Period Length')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: Colors.light.text,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    marginVertical: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    marginVertical: 4,
  },
  barValue: {
    fontSize: 12,
    color: Colors.light.text,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.light.darkGray,
    marginTop: 4,
  },
  lineChartContainer: {
    flexDirection: 'row',
    height: 160,
    marginVertical: 16,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.light.darkGray,
  },
  plotArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dataPointLabel: {
    position: 'absolute',
    fontSize: 10,
    color: Colors.light.text,
    width: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.gray,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.darkGray,
    marginTop: 4,
  },
  noDataContainer: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  noDataText: {
    fontSize: 16,
    color: Colors.light.darkGray,
    fontStyle: 'italic',
  },
});