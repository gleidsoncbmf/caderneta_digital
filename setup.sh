#!/usr/bin/env bash
# =============================================================
# Caderneta Digital - Setup Script
# Roda tudo com: bash setup.sh
# =============================================================

set -e

echo ""
echo "========================================"
echo "  Caderneta Digital - Setup"
echo "========================================"
echo ""

# 1. Copy .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[OK] .env criado"
fi

# 2. Bootstrap Laravel (if not present)
if [ ! -f backend/artisan ]; then
  echo "[INFO] Instalando Laravel no backend..."
  docker run --rm -v "$(pwd)/backend":/app -w /app composer:2.7 \
    create-project laravel/laravel . --prefer-dist --quiet
  echo "[OK] Laravel instalado"
fi

# 3. Copy custom files over the fresh Laravel install
echo "[INFO] Os arquivos customizados já foram criados pelo projeto."

# 4. Copy backend .env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "[OK] backend/.env criado"
fi

# 5. Build and start containers
echo ""
echo "[INFO] Iniciando containers Docker..."
docker-compose up -d --build

echo ""
echo "[INFO] Aguardando MySQL iniciar..."
sleep 15

# 6. Laravel setup inside container
echo "[INFO] Gerando APP_KEY..."
docker-compose exec backend php artisan key:generate --force

echo "[INFO] Rodando migrations..."
docker-compose exec backend php artisan migrate --force

echo "[INFO] Rodando seeders..."
docker-compose exec backend php artisan db:seed --force

echo "[INFO] Permissões de storage..."
docker-compose exec backend chmod -R 775 storage bootstrap/cache

echo ""
echo "========================================"
echo "  PRONTO!"
echo "========================================"
echo ""
echo "  Aplicacao:   http://localhost"
echo "  phpMyAdmin:  http://localhost:8080"
echo ""
echo "  Login demo:"
echo "    email:    demo@cardeneta.com"
echo "    senha:    password"
echo ""
