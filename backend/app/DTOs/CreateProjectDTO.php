<?php

namespace App\DTOs;

class CreateProjectDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly string $name,
        public readonly string $color = '#6366f1',
    ) {}

    public static function fromArray(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            name: $data['name'],
            color: $data['color'] ?? '#6366f1',
        );
    }
}
