module.exports = {
  apps: [{
    name: 'wanderblocks-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Process management
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 5,
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Monitoring
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    
    // Advanced features
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Health check
    health_check_grace_period: 3000,
    
    // Auto restart on file changes (development only)
    watch_options: {
      followSymlinks: false,
      usePolling: true,
      interval: 1000
    }
  }]
};
