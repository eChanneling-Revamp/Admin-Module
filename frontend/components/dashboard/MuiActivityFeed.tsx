'use client';

import { FC, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Chip,
  Divider,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Warning as AlertIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

type NotificationType = 'success' | 'alert' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
}

interface MuiActivityFeedProps {
  notifications?: Notification[];
  activities?: Notification[];
  maxItems?: number;
  title?: string;
  subtitle?: string;
}

const iconMap = {
  success: SuccessIcon,
  alert: AlertIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const colorMap = {
  success: 'success',
  alert: 'warning',
  error: 'error',
  info: 'info',
} as const;

/**
 * MuiActivityFeed - Optimized Material-UI activity feed
 * Features: Time formatting, status badges, scrollable, responsive
 */
export const MuiActivityFeed: FC<MuiActivityFeedProps> = ({
  notifications,
  activities,
  maxItems = 5,
  title = 'Recent Activity',
  subtitle,
}) => {
  const theme = useTheme();
  const data = notifications || activities || [];

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const displayedNotifications = useMemo(() => data.slice(0, maxItems), [data, maxItems]);

  return (
    <Card
      sx={{
        backgroundImage:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.01)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.03)}, ${alpha(theme.palette.secondary.light, 0.01)})`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={title}
        subheader={subtitle || `${data.length} recent events`}
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': { fontSize: '1.25rem', fontWeight: 700 },
          '& .MuiCardHeader-subheader': { fontSize: '0.875rem', mt: 0.5 },
        }}
      />
      <CardContent sx={{ flexGrow: 1, overflow: 'auto', pt: 0 }}>
        {displayedNotifications.length > 0 ? (
          <List sx={{ width: '100%', p: 0 }}>
            {displayedNotifications.map((notification, index) => {
              const IconComponent = iconMap[notification.type];
              const color = colorMap[notification.type];

              return (
                <Box key={notification.id}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                      transition: 'background-color 0.2s ease',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} width="100%" alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 0.75,
                            borderRadius: 1.5,
                            backgroundColor: alpha(theme.palette[color].main, 0.1),
                            color: theme.palette[color].main,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 18 }} />
                        </Box>
                      </ListItemIcon>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              wordBreak: 'break-word',
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type}
                            size="small"
                            color={color}
                            variant="outlined"
                            sx={{ height: 24, fontSize: '0.7rem' }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 0.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          {notification.message}
                        </Typography>

                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <TimeIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {getTimeAgo(notification.timestamp)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </ListItem>

                  {index < displayedNotifications.length - 1 && (
                    <Divider sx={{ my: 0, opacity: 0.5 }} />
                  )}
                </Box>
              );
            })}
          </List>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              color: theme.palette.text.secondary,
            }}
          >
            <InfoIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              No recent activity
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

MuiActivityFeed.displayName = 'MuiActivityFeed';
