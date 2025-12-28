# Load Tests (k6)

Performance load tests for Foundry NFR validation using [k6](https://k6.io/).

## Installation

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Docker
docker run --rm -i grafana/k6 run - <load-tests/pillar-extraction.js
```

## Available Tests

| Test | NFR | Threshold | Description |
|------|-----|-----------|-------------|
| `pillar-extraction.js` | NFR-P2 | p95 < 30s | Pillar extraction performance |
| `spoke-generation.js` | NFR-P3 | p95 < 60s | Spoke generation performance |

## Running Tests

### Quick Start

```bash
cd apps/foundry-dashboard

# Run pillar extraction test against staging
k6 run load-tests/pillar-extraction.js

# Run spoke generation test
k6 run load-tests/spoke-generation.js
```

### With Custom Configuration

```bash
# Target specific environment
k6 run --env BASE_URL=https://foundry.williamjshaw.ca load-tests/pillar-extraction.js

# With authentication token
k6 run --env AUTH_TOKEN=your-token load-tests/spoke-generation.js

# Debug mode (verbose logging)
k6 run --env DEBUG=true load-tests/pillar-extraction.js

# Test specific hub
k6 run --env HUB_ID=your-hub-id load-tests/spoke-generation.js
```

## Test Scenarios

### Pillar Extraction (pillar-extraction.js)

1. **Smoke Test** (1 min)
   - 1 virtual user
   - Small content (1000 chars)
   - Validates basic functionality

2. **Load Test** (16 min)
   - Ramp 0 → 5 → 10 → 0 users
   - Mixed content sizes (1000, 4000, 10000 chars)
   - Validates SLA under load

### Spoke Generation (spoke-generation.js)

1. **Smoke Test** (2 min)
   - 1 virtual user
   - 2 platforms per generation
   - Validates generation works

2. **Load Test** (16 min)
   - Ramp 0 → 3 → 5 → 0 users
   - Random platform selection
   - Validates concurrent generation

## Thresholds

| Metric | NFR-P2 (Pillar) | NFR-P3 (Spoke) |
|--------|-----------------|----------------|
| p95 latency | < 30,000ms | < 60,000ms |
| Success rate | > 99% | > 95% |
| HTTP errors | < 1% | < 5% |

## Results

Results are saved to `load-tests/results/`:

```
results/
├── pillar-extraction-results.json
└── spoke-generation-results.json
```

### Sample Output

```
╔══════════════════════════════════════════════════════════════════╗
║                    NFR-P2 LOAD TEST RESULTS                       ║
╠══════════════════════════════════════════════════════════════════╣
║  Pillar Extraction Performance                                    ║
║  Threshold: p95 < 30 seconds                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  p50:   2500ms                                                    ║
║  p95:  12000ms  ✅ PASS                                           ║
║  p99:  18000ms                                                    ║
║  Success Rate: 99.5%  ✅ PASS                                     ║
╠══════════════════════════════════════════════════════════════════╣
║  Overall: ✅ NFR-P2 PASSED                                        ║
╚══════════════════════════════════════════════════════════════════╝
```

## CI Integration

Add to GitHub Actions workflow:

```yaml
- name: Install k6
  run: |
    curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
    sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/

- name: Run Load Tests
  working-directory: apps/foundry-dashboard
  env:
    BASE_URL: ${{ secrets.STAGING_URL }}
    AUTH_TOKEN: ${{ secrets.E2E_AUTH_TOKEN }}
  run: |
    k6 run load-tests/pillar-extraction.js
    k6 run load-tests/spoke-generation.js

- name: Upload Results
  uses: actions/upload-artifact@v4
  with:
    name: load-test-results
    path: apps/foundry-dashboard/load-tests/results/
```

## Grafana Cloud Integration

For production monitoring, integrate with Grafana Cloud k6:

```bash
# Set API token
export K6_CLOUD_TOKEN=your-token

# Run with cloud output
k6 run --out cloud load-tests/pillar-extraction.js
```
