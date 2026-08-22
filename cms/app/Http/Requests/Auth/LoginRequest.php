<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Validates and performs an admin sign in attempt.
 *
 * The attempt lives here rather than in the controller for the reason
 * docs/TECHNICAL-DESIGN.md ch. 5.3 gives about the property forms: rules
 * belong to a request object, never inline. Rate limiting travels with it,
 * because a limiter that a caller has to remember to invoke is a limiter that
 * will eventually be forgotten.
 */
class LoginRequest extends FormRequest
{
    /**
     * The `guest` middleware already gates this route, so there is no further
     * authorisation to express: anyone not signed in may attempt to sign in.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate, or throw the failure back to the form.
     *
     * The thrown message is keyed on `email` and worded identically whether
     * the address exists or not, per docs/DESIGN-SYSTEM.md ch. 8.6. Telling a
     * caller which half was wrong turns the form into an account enumeration
     * oracle, and the admin gains nothing from the distinction.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Requirement S1. Five attempts a minute per email and IP pair.
     *
     * Keying on the pair rather than on the email alone means one attacker
     * cannot lock the real admin out of their own panel by failing against
     * their address from somewhere else.
     *
     * @throws ValidationException
     */
    protected function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    protected function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
