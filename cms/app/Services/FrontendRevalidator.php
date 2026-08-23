<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Tells the frontend that the property set has changed, so the next visitor
 * sees the edit instead of waiting out the 60 second cache window.
 *
 * The call and its contract are in docs/API-SPEC.md ch. 5.2, the strategy in
 * docs/TECHNICAL-DESIGN.md ch. 3.3. `PropertyObserver` is the only caller.
 *
 * Three rules shape this class, and each is a failure it is written to avoid.
 *
 * **It never throws.** A failed revalidation is logged and swallowed, because
 * the time to live already guarantees eventual consistency: the worst case is
 * a homepage that is up to a minute behind. An editor should never see a save
 * fail because the frontend happened to be down, so nothing here is allowed to
 * reach the request that triggered it.
 *
 * **It fires after the commit, not during the write.** Revalidating inside an
 * open transaction would have the frontend re-read the pre-write rows and
 * cache them for another minute, which is worse than not revalidating at all.
 *
 * **One operation is one call.** A reorder saves up to twenty rows inside a
 * single transaction, and twenty identical POSTs would drop the same tag
 * twenty times.
 */
class FrontendRevalidator
{
    /**
     * The route handler on the frontend, `web/src/app/api/revalidate/route.ts`.
     */
    private const PATH = '/api/revalidate';

    /**
     * The Next.js cache tag the homepage's read is filed under, set in
     * `web/src/lib/api/properties.ts`. One tag, because one section reads
     * the API.
     */
    private const TAG = 'properties';

    /**
     * Short, because an editor is waiting on the redirect behind it. A
     * frontend that has not answered in two seconds is a frontend the 60
     * second time to live can cover for.
     */
    private const TIMEOUT_SECONDS = 2;

    /**
     * Whether a call is already queued behind the current transaction.
     *
     * This is the coalescing half of "one operation is one call", and it is
     * why the container binds this class as a singleton: the observer is
     * resolved fresh for every model event, so the state that spans them has
     * to live in the collaborator rather than in the observer.
     */
    private bool $pending = false;

    /**
     * Queue a drop of the properties tag for the end of the current
     * transaction, or send it now if there is none open.
     */
    public function properties(): void
    {
        if ($this->pending) {
            return;
        }

        $this->pending = true;

        // Runs straight away outside a transaction, and on commit inside one.
        // The flag is cleared before the send rather than after it, so a
        // second batch in the same process queues its own call: the guard is
        // about one operation, not about one lifetime of this object.
        DB::afterCommit(function (): void {
            $this->pending = false;

            $this->send();
        });
    }

    /**
     * Post the callback, or do nothing if there is nowhere to post it.
     *
     * An unset `REVALIDATE_SECRET` turns the feature off rather than sending
     * an unauthenticated call the frontend would refuse with a 401. That is
     * what makes the test suite inert, `phpunit.xml` pins the value empty,
     * and it is deliberate that this path is silent: it is reached on every
     * save, so a log line here would be noise on the scale of the suite.
     */
    private function send(): void
    {
        $url = config('services.frontend.internal_url');
        $secret = config('services.frontend.revalidate_secret');

        if (blank($url) || blank($secret)) {
            return;
        }

        $endpoint = rtrim($url, '/').self::PATH;

        try {
            $response = Http::withHeader('X-Revalidate-Secret', $secret)
                ->acceptJson()
                ->timeout(self::TIMEOUT_SECONDS)
                ->post($endpoint, ['tag' => self::TAG]);

            if ($response->successful()) {
                return;
            }

            $this->giveUp($endpoint, "answered {$response->status()}");
        } catch (Throwable $failure) {
            $this->giveUp($endpoint, 'could not be reached', $failure);
        }
    }

    /**
     * A warning rather than an error: the homepage is stale for up to a
     * minute, which is a degraded state and not a broken one.
     */
    private function giveUp(string $endpoint, string $reason, ?Throwable $failure = null): void
    {
        Log::warning("Revalidating [{$endpoint}] failed: the frontend {$reason}. The homepage will catch up within 60 seconds.", [
            'tag' => self::TAG,
            'exception' => $failure?->getMessage(),
        ]);
    }
}
