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
        <div class="mb-5 rounded-control border border-border border-l-[3px] border-l-danger bg-surface px-4 py-3 text-sm text-danger" role="alert">
            {{ $message }}
        </div>
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
                @class([
                    'focus-ink h-10 rounded-control border bg-surface px-3 text-sm',
                    'border-border' => ! $errors->has('email'),
                    'border-danger' => $errors->has('email'),
                ])
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
                @class([
                    'focus-ink h-10 rounded-control border bg-surface px-3 text-sm',
                    'border-border' => ! $errors->has('password'),
                    'border-danger' => $errors->has('password'),
                ])
            >
            @error('password')
                <span class="text-[13px] leading-[18px] text-danger">{{ $message }}</span>
            @enderror
        </div>

        {{-- RS2: 44px on mobile, 36px from the small breakpoint up. --}}
        <button
            type="submit"
            class="focus-ink flex h-11 w-full items-center justify-center rounded-control bg-accent text-sm font-medium text-ink transition-colors hover:bg-accent-hover sm:h-9"
        >
            Sign in
        </button>
    </form>
@endsection
