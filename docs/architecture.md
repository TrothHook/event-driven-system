# System Architecture

## Overview

This is an event-driven microservices architecture where services communicate asynchronously through Apache Kafka.

## Services

### API Gateway (Port 3000)
- Entry point for all client requests
- Routes HTTP requests to appropriate services
- Handles authentication/authorization
- Aggregates responses from multiple services

### Order Service (Port 3001)
- Manages order lifecycle (create, update, cancel)
- Publishes `order.created` events
- Listens to `payment.processed` and `inventory.updated` events
- Emits `order.confirmed` when all conditions are met

### Payment Service (Port 3002)
- Processes payment transactions
- Validates payment information
- Publishes `payment.processed` events
- Handles payment failures and retries

### Inventory Service (Port 3004)
- Manages product inventory
- Reserves inventory for orders
- Publishes `inventory.updated` events
- Handles backorders and stock notifications

### Notification Service (Port 3003)
- Consumes all events
- Sends notifications (email, SMS, push)
- Publishes to `notification.send` topic

## Data Flow Example: Order Creation

```
1. Client → API Gateway (POST /orders)
2. Order Service receives request → Creates order (PENDING state)
3. Order Service publishes "order.created" event
4. Payment Service subscribes → Processes payment
5. Payment Service publishes "payment.processed" event
6. Inventory Service subscribes → Reserves inventory
7. Inventory Service publishes "inventory.updated" event
8. Order Service subscribes → Updates order to CONFIRMED
9. Notification Service subscribes → Sends confirmation email to customer
```

## Event Topics

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| order.created | Order Service | Payment, Inventory, Notification | New order submitted |
| order.confirmed | Order Service | Payment, Notification | Order confirmed |
| payment.processed | Payment Service | Order, Notification | Payment completed |
| inventory.updated | Inventory Service | Order, Notification | Inventory changed |
| notification.send | Notification Service | External | Send to customers |

## Technology Stack

- **Runtime**: Node.js 18+
- **Message Broker**: Apache Kafka
- **Database**: PostgreSQL
- **Cache**: Redis
- **Language**: TypeScript
- **Framework**: Express.js (API Gateway)

## Deployment

Services can be deployed independently as Docker containers. Use `docker-compose.yml` for local development.

For production, consider:
- Kubernetes orchestration
- Distributed tracing (Jaeger/Zipkin)
- Centralized logging (ELK Stack)
- Monitoring (Prometheus/Grafana)
