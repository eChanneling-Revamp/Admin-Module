'use client';

import { FC, ReactNode } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

interface MuiStatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: number;
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  change?: number;
  label?: string;
}

/**
 * MuiStatsCard - Optimized Material-UI statistics card component
 * Features: Responsive design, smooth animations, dark mode support
 */
export const MuiStatsCard: FC<MuiStatsCardProps> = ({
  title,
  value,
  icon,
  trend = 0,
  color = 'primary',
  change,
  label,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const trendValue = change !== undefined ? change : trend;
  const trendColor = trendValue >= 0 ? 'success' : 'error';
  const trendIcon = trendValue >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.02)})`
            : `linear-gradient(135deg, ${alpha(theme.palette[color].light, 0.05)}, ${alpha(theme.palette[color].light, 0.02)})`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${alpha(theme.palette[color].main, 0.1)}, transparent)`,
          borderRadius: '50%',
          transform: 'translate(40%, -40%)',
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, flexGrow: 1, pb: 2 }}>
        {/* Icon and Trend Badge */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette[color].main}20, ${theme.palette[color].light}20)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 48,
              minHeight: 48,
              color: theme.palette[color].main,
              '& svg': { fontSize: 24 },
            }}
          >
            {icon ? icon : <Box sx={{ width: 24, height: 24 }} />}
          </Box>

          <Chip
            icon={trendIcon}
            label={`${trendValue > 0 ? '+' : ''}${trendValue.toFixed(1)}%`}
            color={trendColor}
            variant="filled"
            size="small"
            sx={{
              fontWeight: 600,
              height: 32,
            }}
          />
        </Stack>

        {/* Content */}
        <Stack spacing={0.5}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.7rem',
            }}
          >
            {title}
          </Typography>

          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              my: 1,
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
            }}
          >
            {label}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

MuiStatsCard.displayName = 'MuiStatsCard';
