module.exports = {
  apps: [{
    name: 'mission-control',
    script: '/usr/bin/npm',
    args: 'start',
    cwd: '/home/clawd/.openclaw/workspace-ceo/mission-control',
    restart_delay: 5000,
    kill_timeout: 10000,
    max_memory_restart: '256M',
    max_restarts: 10,
    min_uptime: '30s',
    merge_logs: true,
    out_file: '/home/clawd/.pm2/logs/mission-control-out.log',
    error_file: '/home/clawd/.pm2/logs/mission-control-error.log',
    pre_stop: 'fuser -k 3000/tcp || true'
  }]
}
