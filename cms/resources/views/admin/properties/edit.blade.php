@extends('layouts.admin')

@section('title', 'Edit property')
@section('heading', $property->title)

@section('content')
    {{-- PUT rather than PATCH, per ch. 5.2. The form submits every field it
         owns on every save, so the request really is a replacement. --}}
    @include('admin.properties.partials.form', [
        'action' => route('admin.properties.update', $property),
        'method' => 'PUT',
        'submit' => 'Save changes',
    ])
@endsection
