<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * The admin comes first, so a reviewer running `db:seed` can sign in even
     * if the property seed later fails.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            PropertySeeder::class,
        ]);
    }
}
