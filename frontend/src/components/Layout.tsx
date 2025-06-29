import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  ListItemButton,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  Analytics,
  Download,
  AccountCircle,
  Logout,
  ChevronLeft,
  Settings,
  Security,
  People,
  History,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Profile states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Form states
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
    autoRefresh: true,
  });

  const [users, setUsers] = useState([
    { id: 1, username: 'admin', email: 'admin@financial.com', role: 'admin', status: 'active' },
    { id: 2, username: 'analyst', email: 'analyst@financial.com', role: 'analyst', status: 'active' },
    { id: 3, username: 'viewer', email: 'viewer@financial.com', role: 'viewer', status: 'active' },
  ]);

  const [activityLog, setActivityLog] = useState([
    { id: 1, action: 'Login', timestamp: '2024-06-29 05:30:00', user: 'admin' },
    { id: 2, action: 'Viewed Transactions', timestamp: '2024-06-29 05:25:00', user: 'admin' },
    { id: 3, action: 'Exported CSV', timestamp: '2024-06-29 05:20:00', user: 'admin' },
    { id: 4, action: 'Updated Transaction #15', timestamp: '2024-06-29 05:15:00', user: 'admin' },
  ]);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Transactions', icon: <Receipt />, path: '/dashboard/transactions' },
    { text: 'Analytics', icon: <Analytics />, path: '/dashboard/analytics' },
    { text: 'Export', icon: <Download />, path: '/dashboard/export' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
    handleProfileMenuClose();
  };

  const handlePasswordClick = () => {
    setPasswordDialogOpen(true);
    handleProfileMenuClose();
  };

  const handleSettingsClick = () => {
    setSettingsDialogOpen(true);
    handleProfileMenuClose();
  };

  const handleUsersClick = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.users);
      setUsersDialogOpen(true);
      handleProfileMenuClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch users',
        severity: 'error',
      });
    }
  };

  const handleActivityClick = async () => {
    if (user?.role !== 'admin') {
      setSnackbar({
        open: true,
        message: 'Access denied. Only admins can view activity logs.',
        severity: 'error',
      });
      handleProfileMenuClose();
      return;
    }
    
    try {
      const response = await authAPI.getActivityLog();
      setActivityLog(response.activityLog);
      setActivityDialogOpen(true);
      handleProfileMenuClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch activity log',
        severity: 'error',
      });
    }
  };

  const handleProfileSave = async () => {
    try {
      // Call the API to update the profile
      await authAPI.updateProfile(profileForm);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
      setProfileDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error',
      });
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters',
        severity: 'error',
      });
      return;
    }

    try {
      // Call the API to change password
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success',
      });
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to change password',
        severity: 'error',
      });
    }
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" noWrap component="div">
          Financial Analytics
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.username}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile Details
        </MenuItem>
        <MenuItem onClick={handlePasswordClick}>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          Change Password
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          System Settings
        </MenuItem>
        {user?.role === 'admin' && (
          <MenuItem onClick={handleUsersClick}>
            <ListItemIcon>
              <People fontSize="small" />
            </ListItemIcon>
            User Management
          </MenuItem>
        )}
        <MenuItem onClick={handleActivityClick}>
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          Activity Log
          {user?.role !== 'admin' && (
            <Chip 
              label="Admin Only" 
              size="small" 
              color="warning" 
              sx={{ ml: 1, fontSize: '0.7rem' }} 
            />
          )}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Profile Details Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Profile Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ width: 64, height: 64 }}>
                  <AccountCircle sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.username}</Typography>
                  <Chip label={user?.role} color="primary" size="small" />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={profileForm.username}
                onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={profileForm.role}
                  label="Role"
                  onChange={(e) => setProfileForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="analyst">Analyst</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProfileSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordSave} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>

      {/* System Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>System Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                These settings will be applied after restarting the application.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog open={usersDialogOpen} onClose={() => setUsersDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Management</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {users.map((user) => (
              <Grid item xs={12} key={user.id}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>
                      <AccountCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{user.username}</Typography>
                      <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label={user.role} color="primary" size="small" />
                    <Chip label={user.status} color={user.status === 'active' ? 'success' : 'error'} size="small" />
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsersDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Activity Log Dialog */}
      <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Activity Log</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {activityLog.map((activity) => (
              <Grid item xs={12} key={activity.id}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Box>
                    <Typography variant="subtitle2">{activity.action}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.timestamp} • {activity.user}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout; 