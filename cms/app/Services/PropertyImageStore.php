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
 * Replacement and force delete cleanup belong to issue #9. This class
 * arrives with the CRUD that first needs it rather than after it, because
 * `properties.image_path` is not nullable: a create form without an upload
 * cannot write a row at all.
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
     * Only two callers are legitimate: a create whose database write failed
     * after the upload landed, and the replacement path in issue #9. A
     * delete never reaches here, because D5 makes deletion soft and keeps
     * the file for a restore.
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
