'use client';

import { FC, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  useTheme,
  useMediaQuery,
  alpha,
  Box,
  CircularProgress,
} from '@mui/material';

interface LineChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface MuiLineChartProps {
  title?: string;
  subtitle?: string;
  data: LineChartDataPoint[];
  lines: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  loading?: boolean;
  onDataPointClick?: (data: LineChartDataPoint) => void;
}

/**
 * Custom Tooltip Component for LineChart with MUI styling
 */
const CustomLineTooltip: FC<any> = ({ active, payload, label }) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          padding: '8px 12px',
          boxShadow: theme.shadows[8],
        }}
      >
        <Box sx={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>
          {label}
        </Box>
        {(payload as any[]).map((entry: any, index: number) => (
          <Box
            key={index}
            sx={{
              fontSize: '0.75rem',
              color: entry.color,
              fontWeight: 500,
            }}
          >
            {entry.name}: {entry.value}
          </Box>
        ))}
      </Box>
    );
  }

  return null;
};

CustomLineTooltip.displayName = 'CustomLineTooltip';

/**
 * MuiLineChart - Optimized Material-UI line chart component
 * Features: Multi-line support, responsive, custom styling, loading state
 */
export const MuiLineChart: FC<MuiLineChartProps> = ({
  title = 'Line Chart',
  subtitle,
  data,
  lines,
  height = 400,
  showLegend = true,
  showGrid = true,
  loading = false,
  onDataPointClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const chartHeight = useMemo(() => {
    if (isMobile) return Math.max(height - 100, 250);
    if (isTablet) return Math.max(height - 50, 300);
    return height;
  }, [height, isMobile, isTablet]);

  // Generate default colors if not provided
  const colorPalette = useMemo(() => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ];
    return lines.map((line, index) => ({
      ...line,
      color: line.color || colors[index % colors.length],
    }));
  }, [lines, theme.palette]);

  const handleDataPointClick = (data: any) => {
    if (onDataPointClick) {
      onDataPointClick(data);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader
          title={title}
          subheader={subtitle}
          titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
          subheaderTypographyProps={{ variant: 'body2' }}
        />
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: chartHeight,
          }}
        >
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        backgroundImage:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.01)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.02)}, ${alpha(theme.palette.secondary.light, 0.01)})`,
      }}
    >
      <CardHeader
        title={title}
        subheader={subtitle}
        titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
        subheaderTypographyProps={{ variant: 'body2' }}
      />
      <CardContent>
        <Box sx={{ width: '100%', height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: isMobile ? 0 : 10,
                bottom: 5,
              }}
              onClick={(data) => handleDataPointClick(data)}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={alpha(theme.palette.divider, 0.5)}
                />
              )}
              <XAxis
                dataKey="name"
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: theme.palette.text.secondary }}
                hide={isMobile}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomLineTooltip />} />
              {showLegend && (
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                  formatter={(value) => (
                    <span style={{ color: theme.palette.text.primary }}>
                      {value}
                    </span>
                  )}
                />
              )}
              {colorPalette.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={{
                    fill: line.color,
                    r: isMobile ? 3 : 4,
                  }}
                  activeDot={{
                    r: isMobile ? 4 : 5,
                  }}
                  isAnimationActive={true}
                  animationDuration={800}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

MuiLineChart.displayName = 'MuiLineChart';
