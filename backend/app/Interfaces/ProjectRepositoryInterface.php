<?php

namespace App\Interfaces;

use App\DTOs\CreateProjectDTO;
use App\Models\Project;
use Illuminate\Support\Collection;

interface ProjectRepositoryInterface
{
    public function getAllForUser(int $userId, ?string $search = null): Collection;

    public function findById(int $id): ?Project;

    public function create(CreateProjectDTO $dto): Project;

    public function update(Project $project, string $name, ?string $color): Project;

    public function delete(Project $project): void;
}
