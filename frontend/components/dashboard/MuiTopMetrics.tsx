'use client';

import { FC, useState, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Stack,
  Grid,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: ReactNode;
}

interface MuiTopMetricsProps {
  metrics: MetricItem[];
}

const colorMap = {
  up: 'success',
  down: 'error',
  stable: 'info',
} as const;

const trendIconMap = {
  up: TrendingUpIcon,
  down: ArrowDownwardIcon,
  stable: TrendingUpIcon,
};

/**
 * MuiTopMetrics - Optimized Material-UI KPI metrics component
 * Features: Responsive grid, trend indicators, smooth animations
 */
export const MuiTopMetrics: FC<MuiTopMetricsProps> = ({ metrics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const gridCols = isMobile ? 1 : isTablet ? 2 : 4;

  return (
    <Grid container spacing={2}>
      {metrics.map((metric) => {
        const TrendIcon = trendIconMap[metric.trend];
        const color = colorMap[metric.trend];

        return (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <Card
              sx={{
                height: '100%',
                backgroundImage:
                  theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.01)})`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.03)}, ${alpha(theme.palette.secondary.light, 0.01)})`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <Stack spacing={1.5}>
                  {/* Icon and Label */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        background: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.primary.main,
                        '& svg': { fontSize: 20 },
                      }}
                    >
                      {metric.icon}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        background: alpha(theme.palette[color].main, 0.1),
                        color: theme.palette[color].main,
                      }}
                    >
                      <TrendIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {Math.abs(metric.change)}%
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Metric Value */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.3,
                      }}
                    >
                      {metric.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mt: 0.5,
                      }}
                    >
                      {metric.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

MuiTopMetrics.displayName = 'MuiTopMetrics';
