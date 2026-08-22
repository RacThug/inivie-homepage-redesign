# Development image for the CMS. Not a production image.
#
# php:8.5-cli already carries every extension Laravel requires, but ships
# pdo_sqlite and no pdo_mysql, so it would start cleanly and fail on the
# first query. It also has neither the zip extension nor an unzip binary,
# which Composer needs to install anything from dist.
#
# See docs/TECHNICAL-DESIGN.md ch. 2.4.

FROM php:8.5-cli

RUN docker-php-ext-install pdo_mysql

# Composer unpacks dist archives with the zip extension or, failing that,
# the unzip binary. The base image has neither, so `composer require`
# aborts. unzip is the smaller of the two fixes.
RUN apt-get update \
 && apt-get install -y --no-install-recommends unzip \
 && rm -rf /var/lib/apt/lists/*

# Pinned Composer, so the host needs no PHP toolchain at all.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
