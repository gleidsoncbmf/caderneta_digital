#!/bin/sh
set -e

echo "==> Waiting for MySQL..."
until php -r "
  try {
    \$pdo = new PDO(
      'mysql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_DATABASE'),
      getenv('DB_USERNAME'),
      getenv('DB_PASSWORD')
    );
    echo 'ok';
  } catch (Exception \$e) {
    exit(1);
  }
" 2>/dev/null; do
  sleep 2
done
echo "==> MySQL ready."

echo "==> Configuring .env..."
cp .env.example .env

sed -i "s|^DB_HOST=.*|DB_HOST=${DB_HOST}|"             .env
sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${DB_DATABASE}|" .env
sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${DB_USERNAME}|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" .env
sed -i "s|^APP_ENV=.*|APP_ENV=${APP_ENV:-local}|"      .env
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=${APP_DEBUG:-true}|"  .env
sed -i "s|^APP_URL=.*|APP_URL=${APP_URL:-http://localhost}|" .env
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=${FRONTEND_URL:-http://localhost}|" .env
sed -i "s|^SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS:-localhost,localhost:3000,127.0.0.1,127.0.0.1:3000}|" .env

echo "==> Generating APP_KEY..."
php artisan key:generate --force

echo "==> Running migrations..."
if ! php artisan migrate --force 2>&1; then
  echo "==> Migrate failed — running migrate:fresh..."
  php artisan migrate:fresh --force
fi

echo "==> Running seeders..."
php artisan db:seed --force 2>&1 || echo "==> Seed already done or skipped."

echo "==> Fixing permissions..."
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage bootstrap/cache               2>/dev/null || true

echo "==> Starting PHP-FPM..."
exec "$@"
