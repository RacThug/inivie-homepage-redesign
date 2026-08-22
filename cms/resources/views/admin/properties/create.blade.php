@extends('layouts.admin')

@section('title', 'New property')
@section('heading', 'New property')

@section('content')
    @include('admin.properties.partials.form', [
        'action' => route('admin.properties.store'),
        'method' => 'POST',
        'submit' => 'Create property',
    ])
@endsection
