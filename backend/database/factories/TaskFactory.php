<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        $status = $this->faker->randomElement(['active', 'active', 'active', 'finalized']);

        return [
            'user_id'      => User::factory(),
            'project_id'   => null,
            'description'  => $this->faker->sentence(rand(5, 12)),
            'who'          => $this->faker->optional(0.4)->name(),
            'start_date'   => $this->faker->optional(0.5)->dateTimeBetween('-7 days', '+7 days'),
            'end_date'     => $this->faker->optional(0.5)->dateTimeBetween('+1 day', '+30 days'),
            'status'       => $status,
            'priority'     => $this->faker->numberBetween(0, 100),
            'is_pinned'    => $this->faker->boolean(10),
            'delegated_to' => $this->faker->optional(0.2)->name(),
            'share_token'  => $this->faker->uuid(),
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => Task::STATUS_ACTIVE]);
    }

    public function finalized(): static
    {
        return $this->state(['status' => Task::STATUS_FINALIZED]);
    }
}
