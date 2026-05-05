<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $demoUser = User::where('email', 'demo@cardeneta.com')->first();

        if ($demoUser) {
            $projects = [
                ['name' => 'Trabalho',       'color' => '#6366f1'],
                ['name' => 'Pessoal',        'color' => '#10b981'],
                ['name' => 'Estudos',        'color' => '#f59e0b'],
                ['name' => 'Saúde',          'color' => '#ef4444'],
                ['name' => 'Financeiro',     'color' => '#8b5cf6'],
            ];

            foreach ($projects as $project) {
                Project::firstOrCreate(
                    ['user_id' => $demoUser->id, 'name' => $project['name']],
                    ['color' => $project['color']]
                );
            }
        }

        // Projects for fake users
        User::where('email', '!=', 'demo@cardeneta.com')->each(function ($user) {
            Project::factory(rand(2, 4))->create(['user_id' => $user->id]);
        });
    }
}
