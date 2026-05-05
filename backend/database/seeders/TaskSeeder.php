<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $demoUser = User::where('email', 'demo@cardeneta.com')->first();

        if ($demoUser) {
            $projects = Project::where('user_id', $demoUser->id)->get();

            $tasks = [
                ['description' => 'Revisar relatório mensal',           'priority' => 0],
                ['description' => 'Reunião com equipe às 10h',          'priority' => 1, 'start_date' => Carbon::today()],
                ['description' => 'Enviar proposta para cliente',       'priority' => 2, 'end_date' => Carbon::tomorrow()],
                ['description' => 'Atualizar documentação do projeto',  'priority' => 3],
                ['description' => 'Estudar Laravel 11',                 'priority' => 4],
                ['description' => 'Pagar conta de luz',                 'priority' => 5, 'end_date' => Carbon::today()->addDays(3)],
                ['description' => 'Agendar consulta médica',            'priority' => 6],
                ['description' => 'Comprar ingredientes para o jantar', 'priority' => 7, 'start_date' => Carbon::today(), 'end_date' => Carbon::today()],
                ['description' => 'Ligar para fornecedor',              'priority' => 8, 'delegated_to' => 'João Silva'],
                ['description' => 'Revisar código do Pull Request #42', 'priority' => 9, 'is_pinned' => true],
            ];

            foreach ($tasks as $i => $taskData) {
                Task::create(array_merge($taskData, [
                    'user_id'    => $demoUser->id,
                    'project_id' => $projects->random()->id,
                    'status'     => 'active',
                    'is_pinned'  => $taskData['is_pinned'] ?? false,
                    'share_token' => \Illuminate\Support\Str::uuid(),
                ]));
            }

            // Some finalized tasks
            for ($i = 0; $i < 5; $i++) {
                Task::create([
                    'user_id'     => $demoUser->id,
                    'project_id'  => $projects->random()->id,
                    'description' => fake()->sentence(rand(4, 10)),
                    'status'      => 'finalized',
                    'priority'    => 100 + $i,
                    'share_token' => \Illuminate\Support\Str::uuid(),
                ]);
            }
        }

        // Tasks for fake users
        User::where('email', '!=', 'demo@cardeneta.com')->each(function ($user) {
            $projects = Project::where('user_id', $user->id)->get();
            Task::factory(rand(5, 10))->create([
                'user_id'    => $user->id,
                'project_id' => $projects->isNotEmpty() ? $projects->random()->id : null,
            ]);
        });
    }
}
