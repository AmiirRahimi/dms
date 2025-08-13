# DMS Backend - IoT Data Management System

A NestJS application that processes x-ray data from IoT devices using RabbitMQ, stores processed information in MongoDB, and provides API endpoints for data retrieval and analysis.

## Features

- **RabbitMQ Integration**: Message queue for processing x-ray data
- **MongoDB Storage**: Persistent storage for processed signals
- **RESTful API**: CRUD operations for signals with filtering capabilities
- **Producer Module**: Simulates IoT devices sending x-ray data
- **Swagger Documentation**: Interactive API documentation
- **Docker Support**: Complete containerized setup
- **Comprehensive Testing**: Unit and integration tests

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- npm or yarn

## Installation & Setup

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmiirRahimi/dms.git
   cd dms-backend
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - MongoDB on port 27017
   - RabbitMQ on port 5672 (Management UI on port 15672)
   - NestJS backend on port 3000

3. **Access the application**
   - API: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api
   - RabbitMQ Management: http://localhost:15672 (admin/admin)

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

3. **Start dependencies with Docker**
   ```bash
   docker-compose up -d mongodb rabbitmq
   ```

4. **Run the application**
   ```bash
   npm run start:dev
   ```

## Testing

### Automated Testing

Run the test script:
```bash
chmod +x test-api.sh
./test-api.sh
```

### Manual Testing

1. **Test the health endpoint**
   ```bash
   curl http://localhost:3000
   ```

2. **Send sample data**
   ```bash
   curl -X POST http://localhost:3000/producer/send-sample
   ```

3. **Get all signals**
   ```bash
   curl http://localhost:3000/signals
   ```

4. **Get signals by device ID**
   ```bash
   curl http://localhost:3000/signals/device/66bb584d4ae73e488c30a072
   ```

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

## API Endpoints

### Signals
- `GET /signals` - Get all signals
- `POST /signals` - Create a new signal
- `GET /signals/:id` - Get signal by ID
- `PATCH /signals/:id` - Update signal
- `DELETE /signals/:id` - Delete signal
- `GET /signals/device/:deviceId` - Get signals by device ID

### Producer
- `POST /producer/send-sample` - Send sample x-ray data
- `POST /producer/send-random` - Send random x-ray data
- `POST /producer/send-random/:deviceId` - Send random data for specific device

## Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── common/
│   ├── dto/                   # Data Transfer Objects
│   └── interfaces/            # TypeScript interfaces
└── modules/
    ├── signals/               # Signals module (CRUD operations)
    ├── rabbitmq/              # RabbitMQ integration
    └── producer/              # Data producer simulation
```

## Configuration

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `RABBITMQ_QUEUE`: Queue name for x-ray data
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Docker Configuration

The `docker-compose.yml` file includes:
- MongoDB service with persistent storage
- RabbitMQ service with management UI
- NestJS backend service with hot reload

## Data Flow

1. **IoT Device** → Sends x-ray data to RabbitMQ queue
2. **Consumer** → Processes incoming data from queue
3. **Signal Service** → Extracts and calculates parameters
4. **MongoDB** → Stores processed signal data
5. **API** → Provides access to stored data

## Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f dms-backend

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build --force-recreate
```

## Monitoring

- **RabbitMQ Management**: http://localhost:15672
  - Username: admin
  - Password: admin

- **MongoDB**: Access via MongoDB Compass or CLI
  - Connection: mongodb://localhost:27017/dms

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Stop existing processes
   pkill -f "nest start"
   # Or use different port in .env
   ```

2. **RabbitMQ connection failed**
   ```bash
   # Check if RabbitMQ is running
   docker-compose ps
   # Restart services
   docker-compose restart
   ```

3. **MongoDB connection issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   ```

## Sample Data Format

```json
{
  "66bb584d4ae73e488c30a072": {
    "data": [
      [762, [51.339764, 12.339223833333334, 1.2038000000000002]],
      [1766, [51.33977733333333, 12.339211833333334, 1.531604]],
      [2763, [51.339782, 12.339196166666667, 2.13906]]
    ],
    "time": 1735683480000
  }
}
```