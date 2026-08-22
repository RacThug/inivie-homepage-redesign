<?php

namespace Tests\Support;

use Illuminate\Http\UploadedFile;

/**
 * A real image file, built byte by byte, for the upload tests.
 *
 * `UploadedFile::fake()->image()` would be the obvious tool, and it is not
 * usable here: it draws with GD, and the development image in
 * cms/Dockerfile has no GD, because nothing in the application needs it. The
 * `image` and `dimensions` rules of ch. 5.3 read the file header through
 * `getimagesize()` and `finfo`, both of which are core PHP.
 *
 * Adding the extension to the image would make the suite depend on the one
 * environment that has it, which is exactly the coupling ch. 2.4 rules out:
 * a reviewer with PHP installed skips Docker entirely, and their PHP may not
 * carry GD either. Thirty lines of PNG here keeps the tests portable.
 *
 * `UploadedFile::fake()->create()` is still the right tool when only the
 * declared mime type matters, since it can claim any type without the bytes
 * to back it.
 */
class FakeImage
{
    /**
     * A valid PNG of the requested dimensions.
     *
     * `$padToKilobytes` inflates the file with a text chunk, for the tests
     * that exercise the 2 MB cap. A PNG decoder skips a chunk it does not
     * recognise, so the file stays valid and keeps its dimensions.
     */
    public static function png(string $name, int $width, int $height, int $padToKilobytes = 0): UploadedFile
    {
        $signature = "\x89PNG\r\n\x1a\n";

        // Bit depth 8, colour type 2 (truecolour RGB), and the three zeroes
        // are the only compression, filter, and interlace methods the format
        // defines.
        $header = pack('NN', $width, $height)."\x08\x02\x00\x00\x00";

        // One filter byte per scanline, then three bytes a pixel. A single
        // flat colour compresses to almost nothing, which is what keeps a
        // 1200 by 900 fixture at a few hundred bytes.
        $pixels = str_repeat("\x00".str_repeat("\xff", $width * 3), $height);

        $chunks = self::chunk('IHDR', $header).self::chunk('IDAT', gzcompress($pixels));

        if ($padToKilobytes > 0) {
            $chunks .= self::chunk('tEXt', "padding\x00".str_repeat('.', $padToKilobytes * 1024));
        }

        return UploadedFile::fake()->createWithContent($name, $signature.$chunks.self::chunk('IEND', ''));
    }

    /**
     * Something that is not an image at all, for the mime type rule.
     */
    public static function notAnImage(string $name = 'brochure.pdf'): UploadedFile
    {
        return UploadedFile::fake()->create($name, 12, 'application/pdf');
    }

    /**
     * Length, type, payload, CRC32 of the type and payload. Every PNG chunk
     * has this shape, which is why it is worth stating once.
     */
    private static function chunk(string $type, string $data): string
    {
        return pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));
    }
}
