<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * The single admin account of docs/TECHNICAL-DESIGN.md ch. 5.1.
 *
 * One role, admin, because PRD ch. 4 puts tiered roles and permissions out of
 * scope. There is no `role` column to set: every user in this application is
 * an admin, and adding a column that only ever holds one value would be
 * modelling a requirement that does not exist.
 *
 * The credentials are published in the README on purpose. They are a demo
 * account on a local database, and a reviewer who cannot sign in cannot
 * review the panel.
 */
class AdminUserSeeder extends Seeder
{
    public const EMAIL = 'admin@inivie.com';

    public const PASSWORD = 'password';

    /**
     * Keyed on the email so re-seeding refreshes the row rather than
     * colliding with the unique constraint, matching how PropertySeeder
     * treats its slugs.
     *
     * The password is rewritten on every run. That is deliberate: a reviewer
     * who has changed it and then forgotten gets back to a documented state
     * with `db:seed`, and there is nothing here worth preserving.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => self::EMAIL],
            [
                'name' => 'iNi ViE Admin',
                'password' => Hash::make(self::PASSWORD),
                'email_verified_at' => now(),
            ],
        );
    }
}
