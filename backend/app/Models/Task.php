<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_ACTIVE    = 'active';
    const STATUS_FINALIZED = 'finalized';
    const STATUS_DELETED   = 'deleted';

    protected $fillable = [
        'user_id',
        'project_id',
        'description',
        'who',
        'start_date',
        'end_date',
        'status',
        'priority',
        'delegated_to',
        'is_pinned',
        'share_token',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'is_pinned'  => 'boolean',
        'priority'   => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Task $task) {
            if (empty($task->share_token)) {
                $task->share_token = Str::uuid()->toString();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class)->withTrashed();
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeFinalized($query)
    {
        return $query->where('status', self::STATUS_FINALIZED);
    }

    public function scopeByPriority($query)
    {
        return $query->orderBy('is_pinned', 'desc')->orderBy('priority', 'asc');
    }
}
