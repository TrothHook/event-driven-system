# Event-Driven System

A distributed event-driven microservices architecture demonstrating async communication patterns using Kafka, PostgreSQL, and Redis.

## Architecture

This system consists of multiple microservices that communicate asynchronously through Kafka:

- **API Gateway**: Entry point for all client requests
- **Order Service**: Handles order creation and management
- **Payment Service**: Processes payments and payment events
- **Inventory Service**: Manages inventory levels
- **Notification Service**: Sends notifications via multiple channels

## Shared Packages

- **kafka/**: Kafka producer/consumer abstractions
- **db/**: Database connection and ORM utilities
- **logger/**: Centralized logging
- **types/**: Shared TypeScript types

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm install

# Create Kafka topics
chmod +x scripts/create-topics.sh
./scripts/create-topics.sh

# Seed database (optional)
npm run seed-db
```

### Running the System

```bash
# Start all services with Docker
docker-compose up -d

# Start individual services in development mode
npm run dev:api-gateway
npm run dev:order-service
npm run dev:payment-service
npm run dev:notification-service
npm run dev:inventory-service
```

## API Documentation

See `docs/architecture.md` for system design and API specifications.

## Development

Each service is an independent Node.js application with its own `package.json`.

Shared code is in the `packages/` directory and should be imported by services.

## Monitoring

- Kafka UI: http://localhost:8080
- Redis Commander: http://localhost:8081
- Postgres: localhost:5432
