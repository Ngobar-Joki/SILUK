<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Session;

class StoreIntendedUrl
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($request->expectsJson()) {
            Session::put('intended_url', $request->url());
        }

        return $next($request);
    }
}
