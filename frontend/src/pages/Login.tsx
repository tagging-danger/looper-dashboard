import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
  Avatar,
  Grid,
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAdmin = async () => {
    try {
      const response = await authAPI.setupAdmin();
      toast.success('Admin user created successfully!');
      console.log('Admin credentials:', {
        email: 'admin@financial.com',
        password: 'admin123',
        token: response.token,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to setup admin');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            width: '100%',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Financial Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to access your financial analytics
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Demo Accounts
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ p: 1 }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" color="primary" display="block">
                      Admin
                    </Typography>
                    <Typography variant="caption" display="block">
                      admin@financial.com
                    </Typography>
                    <Typography variant="caption" display="block">
                      admin123
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ p: 1 }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" color="primary" display="block">
                      Analyst
                    </Typography>
                    <Typography variant="caption" display="block">
                      analyst@financial.com
                    </Typography>
                    <Typography variant="caption" display="block">
                      analyst123
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ p: 1 }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" color="primary" display="block">
                      Viewer
                    </Typography>
                    <Typography variant="caption" display="block">
                      viewer@financial.com
                    </Typography>
                    <Typography variant="caption" display="block">
                      viewer123
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={handleSetupAdmin}
            sx={{ mt: 2 }}
          >
            Setup Admin User
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 