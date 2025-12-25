'use client';

import { FC, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Description as FileTextIcon,
  Settings as SettingsIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { MuiStatsCard } from '@/components/dashboard/MuiStatsCard';
import { MuiTopMetrics } from '@/components/dashboard/MuiTopMetrics';
import { MuiCharts } from '@/components/dashboard/MuiCharts';
import { MuiLineChart } from '@/components/dashboard/MuiLineChart';
import { MuiAdvancedFilters } from '@/components/dashboard/MuiAdvancedFilters';
import { MuiActivityFeed } from '@/components/dashboard/MuiActivityFeed';
import { MuiQuickActions } from '@/components/dashboard/MuiQuickActions';

interface DashboardContentProps {}

export const DashboardContent: FC<DashboardContentProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for stats cards
  const statsData = [
    {
      title: 'Total Appointments',
      value: '1,234',
      icon: 'calendar',
      trend: 12.5,
      color: 'primary' as const,
    },
    {
      title: 'Active Patients',
      value: '567',
      icon: 'users',
      trend: 8.2,
      color: 'success' as const,
    },
    {
      title: 'Total Revenue',
      value: '$45,231',
      icon: 'trending',
      trend: -3.1,
      color: 'error' as const,
    },
    {
      title: 'Pending Tasks',
      value: '89',
      icon: 'task',
      trend: 5.7,
      color: 'warning' as const,
    },
  ];

  // Mock data for top metrics
  const metricsData = [
    { id: '1', label: 'Today Appointments', value: 42, change: 5, icon: 'appointment', trend: 'up' as const },
    { id: '2', label: 'New Patients', value: 18, change: 12, icon: 'newpatient', trend: 'up' as const },
    { id: '3', label: 'Revenue Today', value: 3450, change: -2, icon: 'revenue', trend: 'down' as const },
    { id: '4', label: 'Satisfaction Rate', value: 94, change: 8, icon: 'satisfaction', trend: 'up' as const },
  ];

  // Mock data for bar chart
  const barChartData = [
    { month: 'Jan', appointments: 400, revenue: 2400 },
    { month: 'Feb', appointments: 300, revenue: 1398 },
    { month: 'Mar', appointments: 200, revenue: 9800 },
    { month: 'Apr', appointments: 278, revenue: 3908 },
    { month: 'May', appointments: 189, revenue: 4800 },
    { month: 'Jun', appointments: 239, revenue: 3800 },
  ];

  // Mock data for pie chart
  const pieChartData = [
    { name: 'Completed', value: 45, color: '#10b981' },
    { name: 'Pending', value: 25, color: '#f59e0b' },
    { name: 'Cancelled', value: 20, color: '#ef4444' },
    { name: 'Scheduled', value: 10, color: '#3b82f6' },
  ];

  // Mock data for line chart
  const lineChartData = [
    { name: 'Jan', revenue: 4000, patients: 240, appointments: 80 },
    { name: 'Feb', revenue: 3000, patients: 221, appointments: 100 },
    { name: 'Mar', revenue: 2000, patients: 229, appointments: 120 },
    { name: 'Apr', revenue: 2780, patients: 200, appointments: 90 },
    { name: 'May', revenue: 1890, patients: 229, appointments: 110 },
    { name: 'Jun', revenue: 2390, patients: 200, appointments: 130 },
    { name: 'Jul', revenue: 3490, patients: 210, appointments: 100 },
  ];

  // Mock data for activity feed
  const activityData = [
    {
      id: '1',
      title: 'New appointment booked',
      message: 'John Doe booked an appointment',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'success' as const,
      icon: 'check',
      read: false,
    },
    {
      id: '2',
      title: 'Appointment cancelled',
      message: 'Jane Smith cancelled her appointment',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'error' as const,
      icon: 'close',
      read: false,
    },
    {
      id: '3',
      title: 'Patient profile updated',
      message: 'Mike Johnson updated his profile information',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'info' as const,
      icon: 'info',
      read: true,
    },
    {
      id: '4',
      title: 'Payment received',
      message: 'Payment of $150 received from Sarah Lee',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'success' as const,
      icon: 'check',
      read: true,
    },
    {
      id: '5',
      title: 'System alert',
      message: 'Backup completed successfully',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'alert' as const,
      icon: 'warning',
      read: true,
    },
  ];

  // Quick actions data
  const quickActions = [
    {
      id: 'new-appointment',
      label: 'New Appointment',
      icon: <AddIcon />,
      tooltip: 'Schedule a new appointment',
      color: 'primary' as const,
      onClick: () => console.log('New appointment clicked'),
    },
    {
      id: 'new-patient',
      label: 'New Patient',
      icon: <AddIcon />,
      tooltip: 'Register a new patient',
      color: 'success' as const,
      onClick: () => console.log('New patient clicked'),
    },
    {
      id: 'manage-doctors',
      label: 'Manage Doctors',
      icon: <EditIcon />,
      tooltip: 'Manage doctor profiles',
      color: 'info' as const,
      onClick: () => console.log('Manage doctors clicked'),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileTextIcon />,
      tooltip: 'Generate reports',
      color: 'warning' as const,
      onClick: () => console.log('Reports clicked'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      tooltip: 'Open settings',
      color: 'secondary' as const,
      onClick: () => console.log('Settings clicked'),
    },
    {
      id: 'more',
      label: 'More',
      icon: <MoreHorizIcon />,
      tooltip: 'More actions',
      color: 'inherit' as const,
      onClick: () => console.log('More clicked'),
    },
  ];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleFilterChange = useCallback((filters: any) => {
    console.log('Filters changed:', filters);
  }, []);

  const handleClearFilters = useCallback(() => {
    console.log('Filters cleared');
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: 'calc(100vh - 64px)',
        p: { xs: 2, sm: 3 },
        backgroundImage:
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)',
      }}
    >
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              <DashboardIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Welcome back! Here's your dashboard overview.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              size={isMobile ? 'small' : 'medium'}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size={isMobile ? 'small' : 'medium'}
            >
              Export
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards Section */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MuiStatsCard {...stat} />
            </Grid>
          ))}
        </Grid>

        {/* Top Metrics Section */}
        <Box sx={{ mb: 4 }}>
          <MuiTopMetrics metrics={metricsData} />
        </Box>

        {/* Filters Section */}
        <Box sx={{ mb: 4 }}>
          <MuiAdvancedFilters
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </Box>

        {/* Quick Actions Section */}
        <Box sx={{ mb: 4 }}>
          <MuiQuickActions actions={quickActions} />
        </Box>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <MuiCharts
              chartType="bar"
              title="Appointments & Revenue"
              subtitle="Monthly overview"
              data={barChartData}
              bars={[
                { key: 'appointments', name: 'Appointments', color: '#3b82f6' },
                { key: 'revenue', name: 'Revenue', color: '#10b981' },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MuiCharts
              chartType="pie"
              title="Appointment Status"
              subtitle="Distribution of appointments"
              data={pieChartData}
            />
          </Grid>
        </Grid>

        {/* Line Chart Section */}
        <Box sx={{ mb: 4 }}>
          <MuiLineChart
            title="Trends"
            subtitle="Revenue, patients, and appointments over time"
            data={lineChartData}
            lines={[
              { key: 'revenue', name: 'Revenue', color: '#3b82f6' },
              { key: 'patients', name: 'Patients', color: '#10b981' },
              { key: 'appointments', name: 'Appointments', color: '#f59e0b' },
            ]}
          />
        </Box>

        {/* Activity Feed Section */}
        <Box>
          <MuiActivityFeed notifications={activityData} />
        </Box>
      </Box>
    </Box>
  );
};
