<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
     * The Next.js frontend, as something this application calls rather than
     * as something that calls it. `FrontendRevalidator` posts the cache
     * invalidation callback of docs/API-SPEC.md ch. 5.2 here.
     *
     * Not `FRONTEND_URL`, which `config/cors.php` reads, and the difference
     * is the point. That one is the origin a browser presents, compared as a
     * string. This one is an address this process has to open a socket to,
     * and inside Compose the two are not the same: the frontend runs on the
     * host, which the container reaches under another name. They default to
     * the same value, because everywhere else they are.
     *
     * An unset secret turns revalidation off. See `FrontendRevalidator`.
     */
    'frontend' => [
        'internal_url' => env('FRONTEND_INTERNAL_URL', env('FRONTEND_URL')),
        'revalidate_secret' => env('REVALIDATE_SECRET'),
    ],

];
