import multiprocessing
import os

# Server socket
port = os.environ.get("PORT", "5005")
bind = f"0.0.0.0:{port}"
backlog = 2048

# Worker processes (limit for Railway's resource constraints)
workers = min(multiprocessing.cpu_count() * 2 + 1, 4)
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

