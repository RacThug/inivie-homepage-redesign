# Development image for the CMS. Not a production image.
#
# php:8.5-cli already carries every extension Laravel requires, but ships
# pdo_sqlite and no pdo_mysql, so it would start cleanly and fail on the
# first query. That one extension is the whole reason this file exists.
#
# See docs/TECHNICAL-DESIGN.md ch. 2.4.

FROM php:8.5-cli

RUN docker-php-ext-install pdo_mysql

# Pinned Composer, so the host needs no PHP toolchain at all.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
