<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * The only code in the application that touches stored image files.
 *
 * That single rule is the load-bearing third of the storage seam in
 * docs/TECHNICAL-DESIGN.md ch. 5.5. A controller that reaches for the
 * filesystem directly is a second seam nobody remembers to move, so the
 * move to object storage that ch. 5.5 costs at three environment values
 * would quietly cost a rewrite instead.
 *
 * What it hands back is a relative path, never a URL. `PropertyResource`
 * derives the absolute URL once, from the configured disk. Storing a URL
 * would bake the host into every row.
 *
 * It stores and it removes, and it decides nothing. *When* a file should go
 * is a fact about the record rather than about the disk, so it lives in
 * `PropertyObserver`: the replaced file goes once the save commits, and the
 * file of a deleted property goes only on a force delete, never on the soft
 * delete D5 makes reversible.
 */
class PropertyImageStore
{
    /**
     * Where every property image lives on the configured disk.
     */
    private const PREFIX = 'properties';

    /**
     * Store an upload and return its path relative to the disk root.
     *
     * The filename is the framework's hash rather than the client's own.
     * A client supplied name is attacker controlled: it can collide with
     * an existing file, carry a second extension, or simply leak what the
     * admin called the file on their laptop.
     */
    public function store(UploadedFile $image): string
    {
        return $image->store(self::PREFIX, ['disk' => $this->disk()]);
    }

    /**
     * Remove a stored file, if it is still there.
     *
     * Three callers are legitimate, and they are the three moments a file
     * stops having a row behind it: a write that failed after its upload had
     * already landed, a replacement whose save has committed, and a force
     * delete. Missing paths are not an error here, because the disk is
     * allowed to be behind: a row seeded with a path to a file nobody ever
     * uploaded must not turn an edit into an exception.
     */
    public function remove(string $path): void
    {
        Storage::disk($this->disk())->delete($path);
    }

    /**
     * The default disk, resolved on each call rather than injected once.
     *
     * `FILESYSTEM_DISK` is the seam's configuration value, and a test that
     * swaps it with `Storage::fake()` after this object was constructed
     * has to be seen by an instance the container already handed out.
     */
    private function disk(): string
    {
        return config('filesystems.default');
    }
}
