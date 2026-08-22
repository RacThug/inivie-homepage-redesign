{{--
    The property form, shared by create and edit so the two screens cannot
    disagree about which fields exist. The only differences are the method,
    the action, the submit label, and the current image preview, all of which
    arrive as variables.

    Single column at every width, per docs/DESIGN-SYSTEM.md ch. 8.7. Never
    two columns: a second column buys nothing on a form this short and costs
    a tab order that no longer matches the reading order.

    Fields are grouped into three panels rather than run as one list of
    twelve, because the groups are the questions an editor actually asks:
    what is it, what does it look like, and how should it appear.
--}}
<form
    method="POST"
    action="{{ $action }}"
    enctype="multipart/form-data"
    class="max-w-2xl"
    novalidate
>
    @csrf
    @method($method)

    {{-- One line, not a list of every message: the messages themselves are
         at their fields, per C8. This exists so a failure below the fold is
         still announced at the top of the form. --}}
    @if ($errors->any())
        <div class="mb-4 rounded-control border border-border border-l-[3px] border-l-danger bg-surface px-4 py-3 text-sm" role="alert">
            <span class="font-medium text-danger">
                {{ $errors->count() === 1 ? 'One field needs fixing before this can be saved.' : "{$errors->count()} fields need fixing before this can be saved." }}
            </span>
        </div>
    @endif

    <div class="panel">
        <h2 class="panel-title">Details</h2>

        <div class="flex flex-col gap-4">
            <x-field
                name="title"
                label="Title"
                :value="old('title', $property->title)"
                required
                maxlength="120"
                autofocus
            />

            <x-field
                name="slug"
                label="Slug"
                :value="old('slug', $property->slug)"
                help="Leave this blank to generate it from the title."
                maxlength="140"
            />

            <x-field name="category" label="Category" required>
                <select
                    id="category"
                    name="category"
                    required
                    aria-invalid="{{ $errors->has('category') ? 'true' : 'false' }}"
                    @if ($errors->has('category')) aria-describedby="category-error" @endif
                    class="field-control"
                >
                    <option value="">Choose a category</option>
                    @foreach ($categories as $category)
                        <option
                            value="{{ $category->value }}"
                            @selected(old('category', $property->category?->value) === $category->value)
                        >{{ $category->label() }}</option>
                    @endforeach
                </select>
            </x-field>

            <x-field
                name="location"
                label="Location"
                :value="old('location', $property->location)"
                required
                maxlength="120"
                placeholder="Seminyak, Bali"
            />

            <x-field
                name="excerpt"
                label="Excerpt"
                required
                help="One or two sentences. This is the card copy on the homepage."
            >
                <textarea
                    id="excerpt"
                    name="excerpt"
                    rows="3"
                    required
                    maxlength="240"
                    aria-invalid="{{ $errors->has('excerpt') ? 'true' : 'false' }}"
                    aria-describedby="{{ $errors->has('excerpt') ? 'excerpt-error' : 'excerpt-help' }}"
                    class="field-control"
                >{{ old('excerpt', $property->excerpt) }}</textarea>
            </x-field>
        </div>
    </div>

    <div class="panel mt-4">
        <h2 class="panel-title">Image</h2>

        <div class="flex flex-col gap-4">
            @if ($property->exists)
                {{-- ch. 5.2: the edit form shows a preview of the current
                     image, so the admin can see what they are about to
                     replace rather than guessing from a filename. --}}
                <div class="flex items-center gap-3">
                    <img
                        src="{{ $property->imageUrl() }}"
                        alt="{{ $property->image_alt }}"
                        width="128"
                        height="96"
                        class="h-24 w-32 rounded-control border border-border object-cover"
                    >
                    <p class="text-[13px] leading-[18px] text-ink-muted">
                        The current image.<br>Choosing a new file replaces it.
                    </p>
                </div>
            @endif

            {{-- A browser will not let a file input be repopulated, so a
                 validation failure elsewhere on the form costs the admin
                 this one field. It is the single exception to the preserved
                 values in C8, and there is no way around it. --}}
            <x-field
                name="image"
                label="Image file"
                :required="! $property->exists"
                help="JPG, PNG or WebP, at least 800 by 600 pixels and no larger than 2 MB."
            >
                <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @required(! $property->exists)
                    aria-invalid="{{ $errors->has('image') ? 'true' : 'false' }}"
                    aria-describedby="{{ $errors->has('image') ? 'image-error' : 'image-help' }}"
                    class="field-control h-auto py-2 file:mr-3 file:rounded-control file:border-0 file:bg-surface-alt file:px-3 file:py-1 file:text-sm file:font-medium file:text-ink"
                >
            </x-field>

            <x-field
                name="image_alt"
                label="Image description"
                :value="old('image_alt', $property->image_alt)"
                required
                maxlength="160"
                help="What the photograph shows, for anyone who cannot see it."
            />
        </div>
    </div>

    <div class="panel mt-4">
        <h2 class="panel-title">Listing</h2>

        <div class="flex flex-col gap-4">
            <x-field
                name="price_from"
                label="Price from"
                type="number"
                :value="old('price_from', $property->price_from)"
                min="0"
                step="1"
                inputmode="numeric"
                help="Whole rupiah, without separators. Leave blank if there is no rate to show."
            />

            <x-field
                name="rating"
                label="Rating"
                type="number"
                :value="old('rating', $property->rating)"
                min="0"
                max="5"
                step="0.1"
                help="Out of 5, to one decimal place."
            />

            <x-field
                name="cta_url"
                label="Link"
                type="url"
                :value="old('cta_url', $property->cta_url)"
                maxlength="255"
                placeholder="https://inivie.com/properties/..."
                help="Where the button on the card sends a guest."
            />

            <x-field
                name="sort_order"
                label="Order"
                type="number"
                :value="old('sort_order', $property->sort_order ?? 0)"
                required
                min="0"
                step="1"
                inputmode="numeric"
                help="Lower numbers come first on the homepage."
            />

            {{-- Not an x-field: the label of a checkbox belongs beside the
                 control rather than above it. --}}
            <div class="flex flex-col gap-1.5">
                <label for="is_published" class="flex items-center gap-2.5 text-sm font-medium">
                    <input
                        id="is_published"
                        name="is_published"
                        type="checkbox"
                        value="1"
                        @checked(old('is_published', $property->is_published))
                        class="focus-ink size-4 accent-ink"
                    >
                    Published
                </label>
                <p class="text-[13px] leading-[18px] text-ink-muted">
                    A draft is invisible to the homepage and to the public API until this is ticked.
                </p>
            </div>
        </div>
    </div>

    <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <a href="{{ route('admin.properties.index') }}" class="btn btn-secondary">Cancel</a>
        <button type="submit" class="btn btn-primary">{{ $submit }}</button>
    </div>
</form>
