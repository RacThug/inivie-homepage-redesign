<?php

use App\Models\User;

/*
| Requirement C1 and S1: sign in, and be blocked from every admin screen when
| signed out.
|
| The full admin suite belongs to a later issue. What is here is the part that
| would be dishonest to defer: a PR that adds `auth` middleware without
| proving it locks anything is a PR claiming a security property it has not
| demonstrated.
|
| The rate limiter needs no teardown. Laravel rebuilds the application for
| each test and phpunit.xml pins CACHE_STORE to `array`, so the limiter's
| state cannot outlive the test that created it.
*/

/**
 * The validation message the form actually rendered, read from the session
 * the redirect flashed it into.
 */
function loginError(): string
{
    return session('errors')->first('email');
}

it('shows the login screen to a signed out visitor', function () {
    $this->get('/admin/login')
        ->assertOk()
        ->assertSee('Sign in');
});

it('signs a valid admin in and lands them on the dashboard', function () {
    $admin = User::factory()->create(['password' => 'correct-horse']);

    $this->post('/admin/login', [
        'email' => $admin->email,
        'password' => 'correct-horse',
    ])->assertRedirect(route('admin.dashboard'));

    $this->assertAuthenticatedAs($admin);
});

it('rejects a wrong password and sends the admin back to the form', function () {
    $admin = User::factory()->create(['password' => 'correct-horse']);

    $this->from('/admin/login')
        ->post('/admin/login', [
            'email' => $admin->email,
            'password' => 'not-the-password',
        ])
        ->assertRedirect('/admin/login')
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('words a rejected attempt identically whether the account exists or not', function () {
    // docs/DESIGN-SYSTEM.md ch. 8.6. If these two differ, the form tells an
    // attacker which addresses are real. It is the reason the failure is
    // keyed on `email` rather than on `password`.
    User::factory()->create(['email' => 'real@inivie.com', 'password' => 'correct-horse']);

    $this->post('/admin/login', ['email' => 'real@inivie.com', 'password' => 'wrong'])
        ->assertSessionHasErrors('email');
    $known = loginError();

    $this->flushSession();

    $this->post('/admin/login', ['email' => 'nobody@inivie.com', 'password' => 'wrong'])
        ->assertSessionHasErrors('email');

    expect(loginError())->toBe($known);
});

it('locks an attacker out after five failures', function () {
    // Requirement S1. Laravel's own limiter, exercised through the form
    // rather than trusted: it is wired up in LoginRequest, and a
    // configuration nobody asserts is a configuration that can be deleted
    // without anything noticing.
    $admin = User::factory()->create(['password' => 'correct-horse']);

    foreach (range(1, 5) as $ignored) {
        $this->post('/admin/login', ['email' => $admin->email, 'password' => 'wrong'])
            ->assertSessionHasErrors('email');

        $this->flushSession();
    }

    // The correct password is refused too, which is the point: the lockout
    // is on the attempt rate, not on the credentials.
    $this->post('/admin/login', ['email' => $admin->email, 'password' => 'correct-horse'])
        ->assertSessionHasErrors('email');

    expect(loginError())->toContain('seconds');
    $this->assertGuest();
});

it('keys the limiter on the email and ip pair, not on the email alone', function () {
    // Otherwise anyone who knows the admin's address can lock them out of
    // their own panel by failing against it from somewhere else.
    $admin = User::factory()->create(['password' => 'correct-horse']);

    foreach (range(1, 5) as $ignored) {
        $this->post('/admin/login', ['email' => $admin->email, 'password' => 'wrong']);
        $this->flushSession();
    }

    $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.7'])
        ->post('/admin/login', ['email' => $admin->email, 'password' => 'correct-horse'])
        ->assertRedirect(route('admin.dashboard'));

    $this->assertAuthenticatedAs($admin);
});

it('regenerates the session id on sign in', function () {
    // Fixation defence. A session id issued before sign in must not survive
    // it, or anyone who knew the old id is signed in as the admin.
    $admin = User::factory()->create(['password' => 'correct-horse']);

    $this->get('/admin/login');
    $before = session()->getId();

    $this->post('/admin/login', ['email' => $admin->email, 'password' => 'correct-horse']);

    expect(session()->getId())->not->toBe($before);
});

it('signs an admin out and sends them back to the login screen', function () {
    $this->actingAs(User::factory()->create())
        ->post('/admin/logout')
        ->assertRedirect(route('login'))
        // C8. The flash is set after the session is invalidated, so this
        // also pins down that it lands in the new session rather than the
        // one just discarded.
        ->assertSessionHas('status', 'You have been signed out.');

    $this->assertGuest();
});

it('shows the sign out confirmation on the login screen', function () {
    $this->actingAs(User::factory()->create())->post('/admin/logout');

    $this->get('/admin/login')
        ->assertOk()
        ->assertSee('You have been signed out.');
});

it('keeps a signed in admin away from the login screen', function () {
    $this->actingAs(User::factory()->create())
        ->get('/admin/login')
        ->assertRedirect('/admin');
});
