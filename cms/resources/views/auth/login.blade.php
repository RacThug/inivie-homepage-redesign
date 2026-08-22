@extends('layouts.guest')

@section('title', 'Sign in')
@section('heading', 'Sign in')

@section('content')
    {{--
        One message above the fields, worded identically whether the email
        exists or not, so the form is not an account enumeration oracle. Once
        the rate limiter of TECHNICAL-DESIGN ch. 5.1 trips, its throttle
        message replaces this one, which is why both arrive on the same
        `email` key.
    --}}
    @error('email')
        <x-notice variant="failure" class="mb-5">
            <span class="font-medium text-danger">{{ $message }}</span>
        </x-notice>
    @enderror

    <form method="POST" action="{{ route('login') }}" novalidate>
        @csrf

        <div class="mb-4 flex flex-col gap-1.5">
            <label for="email" class="text-[13px] leading-[18px] font-medium">Email</label>
            <input
                id="email"
                name="email"
                type="email"
                value="{{ old('email') }}"
                required
                autofocus
                autocomplete="username"
                class="field-control"
                @if ($errors->has('email')) aria-invalid="true" @endif
            >
        </div>

        <div class="mb-4 flex flex-col gap-1.5">
            <label for="password" class="text-[13px] leading-[18px] font-medium">Password</label>
            <input
                id="password"
                name="password"
                type="password"
                required
                autocomplete="current-password"
                class="field-control"
                @if ($errors->has('password')) aria-invalid="true" @endif
            >
            @error('password')
                <span class="text-[13px] leading-[18px] text-danger">{{ $message }}</span>
            @enderror
        </div>

        {{-- Full width, per ch. 8.6. The height, the fill, and the focus
             ring come from the shared variant in app.css. --}}
        <button type="submit" class="btn btn-primary w-full">
            Sign in
        </button>
    </form>
@endsection
