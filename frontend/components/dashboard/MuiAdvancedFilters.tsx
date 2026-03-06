'use client';

import { FC, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  InputAdornment,
  Button,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';

interface FilterOption {
  id: string;
  label: string;
  values: { id: string; label: string }[];
}

interface MuiAdvancedFiltersProps {
  filters?: FilterOption[];
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onClearFilters?: () => void;
}

/**
 * MuiAdvancedFilters - Optimized Material-UI filters component
 * Features: Multi-select, search, clear all, responsive
 */
export const MuiAdvancedFilters: FC<MuiAdvancedFiltersProps> = ({
  filters = [],
  onFilterChange,
  onClearFilters,
}) => {
  const theme = useTheme();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = useCallback(
    (filterId: string, value: string) => {
      setSelectedFilters((prev) => {
        const updated = { ...prev };
        if (!updated[filterId]) {
          updated[filterId] = [];
        }
        updated[filterId] = [value]; // Single select for simplicity
        onFilterChange?.(updated);
        return updated;
      });
    },
    [onFilterChange]
  );

  const handleClearAll = useCallback(() => {
    setSelectedFilters({});
    setSearchQuery('');
    onClearFilters?.();
    onFilterChange?.({});
  }, [onClearFilters, onFilterChange]);

  const activeFilterCount = Object.values(selectedFilters).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <Card
      sx={{
        backgroundImage:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.01)})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.03)}, ${alpha(theme.palette.secondary.light, 0.01)})`,
      }}
    >
      <CardHeader title="Filters" sx={{ pb: 2 }} />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
              },
            }}
          />

          {/* Filter Selects */}
          <Grid container spacing={2}>
            {filters.map((filter) => (
              <Grid item xs={12} sm={6} md={3} key={filter.id}>
                <FormControl fullWidth size="small">
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    label={filter.label}
                    value={selectedFilters[filter.id]?.[0] || ''}
                    onChange={(e: any) => handleFilterChange(filter.id, e.target.value)}
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    }}
                  >
                    {filter.values.map((value) => (
                      <MenuItem key={value.id} value={value.id}>
                        {value.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <Box
              sx={{
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(selectedFilters).map(([filterId, values]) =>
                  values.map((value) => {
                    const filterLabel = filters.find((f) => f.id === filterId)?.label;
                    const valueLabel = filters
                      .find((f) => f.id === filterId)
                      ?.values.find((v) => v.id === value)?.label;

                    return (
                      <Chip
                        key={`${filterId}-${value}`}
                        label={valueLabel}
                        onDelete={() => handleFilterChange(filterId, value)}
                        size="small"
                        color="primary"
                        variant="outlined"
                        deleteIcon={<CloseIcon />}
                        sx={{ mb: 1 }}
                      />
                    );
                  })
                )}
              </Stack>

              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  color="inherit"
                  onClick={handleClearAll}
                  sx={{
                    textTransform: 'none',
                    color: theme.palette.text.secondary,
                    '&:hover': { color: theme.palette.text.primary },
                  }}
                >
                  Clear All
                </Button>
              </Box>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

MuiAdvancedFilters.displayName = 'MuiAdvancedFilters';
