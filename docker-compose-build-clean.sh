#!/bin/bash

# Define a frequência de limpeza (em número de builds)
CLEAN_FREQUENCY=5

# Define um arquivo para armazenar o contador de builds
BUILD_COUNTER_FILE="./.build_counter"

# Função para limpar recursos do Docker
clean_docker() {
    echo "Limpando volumes, imagens e contêineres não utilizados..."
    docker system prune -a --volumes -f
}

# Função para incrementar o contador de builds
increment_build_counter() {
    if [ ! -f "$BUILD_COUNTER_FILE" ]; then
        echo "0" > "$BUILD_COUNTER_FILE"
    fi
    COUNTER=$(cat "$BUILD_COUNTER_FILE")
    COUNTER=$((COUNTER + 1))
    echo "$COUNTER" > "$BUILD_COUNTER_FILE"
    echo "Build número: $COUNTER"
}

# Função para verificar se é hora de limpar
check_cleanup() {
    COUNTER=$(cat "$BUILD_COUNTER_FILE")
    if [ "$COUNTER" -ge "$CLEAN_FREQUENCY" ]; then
        clean_docker
        echo "0" > "$BUILD_COUNTER_FILE"  # Reseta o contador
    fi
}

# Função principal: rodar o Docker Compose
run_docker_compose() {
    echo "Executando Docker Compose..."
    docker compose up --build
}

# Incremente o contador de builds
increment_build_counter

# Verifique se é hora de realizar a limpeza
check_cleanup

# Execute o Docker Compose
run_docker_compose
