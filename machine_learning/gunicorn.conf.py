import multiprocessing

# Server socket
bind = "0.0.0.0:5005"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 300  # Increased timeout for long-running ML pipelines
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "nasa_exoplanet_ml"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed in the future)
# keyfile = None
# certfile = None

