'use client';

import { FC, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  useTheme,
  useMediaQuery,
  alpha,
  Box,
} from '@mui/material';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartDataPoint {
  month: string;
  web: number;
  telco: number;
  agent: number;
  [key: string]: string | number;
}

interface ReconciliationData {
  name: string;
  value: number;
  color: string;
}

interface MuiBarChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
}

interface MuiPieChartProps {
  data: ReconciliationData[];
  title?: string;
  subtitle?: string;
}

const CHART_COLORS = {
  web: '#1976D2',
  telco: '#4CAF50',
  agent: '#FF9800',
};

/**
 * MuiBarChart - Optimized Material-UI bar chart
 * Features: Responsive, dark mode support, smooth tooltips
 */
export const MuiBarChart: FC<MuiBarChartProps> = ({ data, title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const ChartTooltip = useMemo(
    () =>
      ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;

        return (
          <Box
            sx={{
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              p: 1.5,
              boxShadow: theme.shadows[4],
            }}
          >
            <Box sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
              {label}
            </Box>
            {payload.map((entry: any, idx: number) => (
              <Box
                key={idx}
                sx={{
                  color: entry.color,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                {entry.name}: {entry.value.toLocaleString()}
              </Box>
            ))}
          </Box>
        );
      },
    [theme]
  );

  return (
    <Card
      sx={{
        backgroundImage:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.01)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.03)}, ${alpha(theme.palette.secondary.light, 0.01)})`,
        height: '100%',
      }}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          sx={{
            pb: 2,
            '& .MuiCardHeader-title': { fontSize: '1.25rem', fontWeight: 700 },
            '& .MuiCardHeader-subheader': { fontSize: '0.875rem', mt: 0.5 },
          }}
        />
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 350}>
          <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.3} />
            <XAxis
              dataKey="month"
              stroke={theme.palette.text.secondary}
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: '0.875rem' }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Bar dataKey="web" fill={CHART_COLORS.web} name="Web" radius={[4, 4, 0, 0]} />
            <Bar dataKey="telco" fill={CHART_COLORS.telco} name="Telco" radius={[4, 4, 0, 0]} />
            <Bar dataKey="agent" fill={CHART_COLORS.agent} name="Agent" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * MuiPieChart - Optimized Material-UI pie chart
 * Features: Responsive, dark mode support, interactive segments
 */
export const MuiPieChart: FC<MuiPieChartProps> = ({ data, title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const ChartTooltip = useMemo(
    () =>
      ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;

        const { name, value, color } = payload[0].payload;
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percentage = ((value / total) * 100).toFixed(1);

        return (
          <Box
            sx={{
              background: theme.palette.background.paper,
              border: `2px solid ${color}`,
              borderRadius: 1,
              p: 1.5,
              boxShadow: theme.shadows[4],
            }}
          >
            <Box sx={{ fontWeight: 600, color: color, mb: 0.5 }}>
              {name}
            </Box>
            <Box sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              {value.toLocaleString()} ({percentage}%)
            </Box>
          </Box>
        );
      },
    [data, theme]
  );

  return (
    <Card
      sx={{
        backgroundImage:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.01)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.03)}, ${alpha(theme.palette.secondary.light, 0.01)})`,
        height: '100%',
      }}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          sx={{
            pb: 2,
            '& .MuiCardHeader-title': { fontSize: '1.25rem', fontWeight: 700 },
            '& .MuiCardHeader-subheader': { fontSize: '0.875rem', mt: 0.5 },
          }}
        />
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 350}>
          <RechartsPieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ value, name }: any) => {
                const total = data.reduce((sum, item) => sum + item.value, 0);
                const percentage = ((value / total) * 100).toFixed(0);
                return `${percentage}%`;
              }}
              outerRadius={isMobile ? 80 : 100}
              innerRadius={isMobile ? 50 : 60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

MuiBarChart.displayName = 'MuiBarChart';
MuiPieChart.displayName = 'MuiPieChart';

interface MuiChartsProps {
  chartType: 'bar' | 'pie';
  title?: string;
  subtitle?: string;
  data: any[];
  bars?: Array<{ key: string; name: string; color?: string }>;
}

export const MuiCharts: FC<MuiChartsProps> = ({ chartType, ...props }) => {
  if (chartType === 'bar') {
    return <MuiBarChart {...(props as any)} />;
  }
  if (chartType === 'pie') {
    return <MuiPieChart {...(props as any)} />;
  }
  return null;
};

MuiCharts.displayName = 'MuiCharts';
