FROM php:8.3-fpm

# System dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# 1) Scaffold fresh Laravel into a temp dir
RUN composer create-project laravel/laravel /tmp/laravel --prefer-dist --quiet \
    && cp -rn /tmp/laravel/. /var/www/ \
    && rm -rf /tmp/laravel

WORKDIR /var/www

# 2) Install Sanctum
RUN composer require laravel/sanctum --no-interaction --quiet

# 3) Publish Sanctum migration during BUILD (fixed timestamp, no duplicates on restart)
#    We need a minimal .env so artisan can boot; no DB needed for vendor:publish
RUN echo "APP_KEY=base64:dummykeyforbuildonlyXXXXXXXXXXXXXXXXXXXXXXX=" > .env \
    && php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider" --quiet \
    && rm .env

# 4) Copy our custom files ON TOP of the Laravel scaffold
COPY app/       app/
COPY database/  database/
COPY routes/    routes/
COPY bootstrap/ bootstrap/
COPY .env.example .env.example

# 5) Set .env (runtime values injected by entrypoint)
RUN cp .env.example .env

# 6) Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# 7) Entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
