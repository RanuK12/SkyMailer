from django.shortcuts import redirect

def redirect_to_emailer(request):
    return redirect('/emailer/')
