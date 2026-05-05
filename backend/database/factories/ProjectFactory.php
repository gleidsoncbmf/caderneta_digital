<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        $colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

        return [
            'user_id' => User::factory(),
            'name'    => $this->faker->words(2, true),
            'color'   => $this->faker->randomElement($colors),
        ];
    }
}
