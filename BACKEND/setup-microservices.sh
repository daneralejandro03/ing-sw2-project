#!/bin/bash

# Crear la red compartida si no existe
if ! docker network ls | grep -q microservices-network; then
  echo "Creating microservices network..."
  docker network create microservices-network
fi

# Función para verificar si un servicio está en ejecución
check_service() {
  local service=$1
  local url=$2
  local max_attempts=10
  local attempt=1
  
  echo "Checking if $service is available at $url..."
  
  while [ $attempt -le $max_attempts ]; do
    if wget --spider -q "$url"; then
      echo "$service is up and running!"
      return 0
    fi
    
    echo "Attempt $attempt: $service not yet available, waiting..."
    sleep 3
    attempt=$((attempt + 1))
  done
  
  echo "Warning: $service is not responding after $max_attempts attempts."
  return 1
}

# Iniciar servicio de notificaciones (opcional)
start_notifications() {
  echo "Starting ms-notifications service..."
  cd BACKEND/ms-notifications
  docker-compose up -d
  cd ../..
  
  # Verificar que el servicio esté respondiendo
  check_service "ms-notifications" "http://localhost:3000/health"
}

# Iniciar servicio de seguridad
start_security() {
  echo "Starting ms-security service..."
  cd BACKEND/ms-security
  docker-compose up -d
  cd ../..
  
  # Verificar que el servicio esté respondiendo
  check_service "ms-security" "http://localhost:3001/health"
}

# Menú para el usuario
echo "=== Microservices Deployment ==="
echo "1. Start both services"
echo "2. Start ms-notifications only"
echo "3. Start ms-security only"
echo "4. Stop all services"
echo "5. Check services status"
read -p "Select an option: " option

case $option in
  1)
    start_notifications
    start_security
    ;;
  2)
    start_notifications
    ;;
  3)
    start_security
    ;;
  4)
    echo "Stopping all services..."
    cd BACKEND/ms-notifications && docker-compose down && cd ../..
    cd BACKEND/ms-security && docker-compose down && cd ../..
    ;;
  5)
    echo "Checking services status..."
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E 'ms-notifications|ms-security'
    ;;
  *)
    echo "Invalid option"
    ;;
esac