<?php

namespace App\Repositories;

use App\DTOs\CreateProjectDTO;
use App\Interfaces\ProjectRepositoryInterface;
use App\Models\Project;
use Illuminate\Support\Collection;

class ProjectRepository implements ProjectRepositoryInterface
{
    public function getAllForUser(int $userId, ?string $search = null): Collection
    {
        return Project::where('user_id', $userId)
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): ?Project
    {
        return Project::find($id);
    }

    public function create(CreateProjectDTO $dto): Project
    {
        return Project::create([
            'user_id' => $dto->userId,
            'name'    => $dto->name,
            'color'   => $dto->color,
        ]);
    }

    public function update(Project $project, string $name, ?string $color): Project
    {
        $project->update(['name' => $name, 'color' => $color ?? $project->color]);
        return $project->fresh();
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }
}
