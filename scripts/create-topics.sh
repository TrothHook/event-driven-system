#!/bin/bash

#1. when an order has failed, if same order placed again, a new record is created in orders table, the old record with same id has status as "CREATED"

# Script to create Kafka topics for the event-driven system

KAFKA_BROKER=${KAFKA_BROKER:-redpanda:9092}

echo "Creating Kafka topics..."

# Create topics
docker-compose exec -T redpanda kafka-topics --create \
  --bootstrap-server $KAFKA_BROKER \
  --topic order.created \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

docker-compose exec -T kafka kafka-topics --create \
  --bootstrap-server $KAFKA_BROKER \
  --topic order.confirmed \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

docker-compose exec -T kafka kafka-topics --create \
  --bootstrap-server $KAFKA_BROKER \
  --topic payment.processed \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

docker-compose exec -T kafka kafka-topics --create \
  --bootstrap-server $KAFKA_BROKER \
  --topic inventory.updated \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

docker-compose exec -T kafka kafka-topics --create \
  --bootstrap-server $KAFKA_BROKER \
  --topic notification.send \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

echo "Topics created successfully!"

# List all topics
docker-compose exec -T redpanda kafka-topics --list --bootstrap-server $KAFKA_BROKER
