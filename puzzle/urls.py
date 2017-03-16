from django.conf.urls import url
from . import views

app_name = 'puzzle'

urlpatterns = [
    # /puzzle/
    url(r'^$', views.index, name='index'),
    # /puzzle/builder/
    url(r'^builder/$', views.builder, name='builder'),
    # /puzzle/builder/send/
    url(r'^builder/send/$', views.send, name='send'),
    # /puzzle/builder/random_template/
    url(r'^builder/random_template/$', views.random_template, name='random_template'),
    # /puzzle/<puzzle_id>/
    url(r'^(?P<puzzle_id>[0-9]+)/$', views.play, name='play'),
    # /puzzle/<puzzle_id>/puzzle.js
    url(r'^(?P<puzzle_id>[0-9]+)/puzzle.js$', views.play_js, name='playjs'),
    # /puzzle/<puzzle_id>/pdf
    url(r'^(?P<puzzle_id>[0-9]+)/pdf$', views.pdf, name='pdf'),
]
