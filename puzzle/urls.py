from django.conf.urls import url
from . import views
from . import word_info

app_name = 'puzzle'

urlpatterns = [
    # /puzzle/
    url(r'^$', views.index, name='index'),
    # /puzzle/builder/
    url(r'^builder/$', views.builder, name='builder'),
    # /puzzle/builder/random_template/
    url(r'^builder/random_template/$', views.random_template, name='random_template'),
    # /puzzle/builder/fill_out_grid/
    url(r'^builder/fill_out_grid/$', views.fill_out_grid_stream, name='fill_out_grid'),
    # /puzzle/builder/stream_test/
    url(r'^builder/fill_out_grid/$', views.stream_test, name='stream_test'),
    # /puzzle/builder/publish/
    url(r'^builder/publish/$', views.publish, name='publish'),
    # /puzzle/builder/word_info/
    url(r'^builder/word_info/$', word_info.get_word_info, name='get_html'),
    # /puzzle/<puzzle_id>/
    url(r'^(?P<puzzle_id>[0-9]+)/$', views.play, name='play'),
    # /puzzle/<puzzle_id>/puzzle.js
    url(r'^(?P<puzzle_id>[0-9]+)/puzzle.js$', views.play_js, name='playjs'),
    # /puzzle/<puzzle_id>/pdf
    url(r'^(?P<puzzle_id>[0-9]+)/pdf$', views.pdf, name='pdf'),
]
