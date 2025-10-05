# NASA Exoplanet Detection - Machine Learning

## Setup

Install dependencies:
```bash
pip install -r requirements.txt
```

On macOS, if you encounter issues with `lightgbm`, install libomp:
```bash
brew install libomp
```

## Run Server

### Development (Flask)

```bash
python server.py
```

### Production (Gunicorn)

```bash
gunicorn server:app -c gunicorn.conf.py
```

Or with custom settings:
```bash
gunicorn server:app --bind 0.0.0.0:5005 --workers 4 --timeout 300
```

Server runs on `http://localhost:5005`

## Endpoints

- `GET /` - Server status and available endpoints
- `GET /ensemble` - Run ensemble pipeline
- `GET /binary` - Run binary categories pipeline
- `GET /multistep` - Run multistep pipeline

## Example Usage

```bash
# Check server status
curl http://localhost:5005/

# Run ensemble pipeline
curl http://localhost:5005/ensemble

# Run binary pipeline
curl http://localhost:5005/binary

# Run multistep pipeline
curl http://localhost:5005/multistep
```

