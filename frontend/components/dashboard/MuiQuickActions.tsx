'use client';

import { FC, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
  Theme,
} from '@mui/material';

type PaletteColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  color?: 'inherit' | PaletteColor;
  tooltip?: string;
}

interface MuiQuickActionsProps {
  actions: QuickAction[];
}

const getActionColor = (theme: Theme, color?: string): string => {
  const paletteColors: PaletteColor[] = ['primary', 'secondary', 'success', 'error', 'warning', 'info'];
  
  if (color && paletteColors.includes(color as PaletteColor)) {
    return theme.palette[color as PaletteColor].main;
  }
  
  return theme.palette.primary.main;
};

/**
 * MuiQuickActions - Optimized Material-UI quick actions component
 * Features: Icon buttons, tooltips, responsive grid, customizable
 */
export const MuiQuickActions: FC<MuiQuickActionsProps> = ({ actions }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const gridCols = isMobile ? 2 : isTablet ? 3 : 6;

  return (
    <Card
      sx={{
        backgroundImage:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.01)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.03)}, ${alpha(theme.palette.secondary.light, 0.01)})`,
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          {actions.map((action) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={action.id}>
              <Tooltip title={action.tooltip || action.label} arrow>
                <Box
                  component={Button}
                  onClick={action.onClick}
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: 100,
                    flexDirection: 'column',
                    gap: 1,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  variant="text"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      color: getActionColor(theme, action.color),
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Box
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      textTransform: 'capitalize',
                      lineHeight: 1.2,
                    }}
                  >
                    {action.label}
                  </Box>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

MuiQuickActions.displayName = 'MuiQuickActions';
